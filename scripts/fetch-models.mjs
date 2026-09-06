#!/usr/bin/env node
/**
 * สร้าง public/models.json จาก Ollama registry
 *
 * 1) โมเดลใน scripts/models.seed.json (คิวเรตเอง) -> ดึงขนาดจริงมาคำนวณ needs
 * 2) โมเดลใหม่ใน ollama.com/library ที่ยังไม่มีใน seed -> เพิ่มอัตโนมัติ (auto:true)
 *    - ข้ามพวก embedding / rerank / guard (ไม่ใช่โมเดลแชต)
 *    - เลือกเฉพาะ tag ขนาดที่สะอาด (เช่น 8b, 30b-a3b) จำกัดจำนวนต่อครอบครัว
 *    - เดาหมวดจากชื่อ + ใส่คำอธิบายทั่วไป (แก้ทีหลังได้โดยย้ายเข้ามาใน seed)
 *
 * ต้องใช้ Node 18+ (มี global fetch)
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REGISTRY = "https://registry.ollama.ai";
const LIBRARY = "https://ollama.com/library";
const MANIFEST_ACCEPT = "application/vnd.docker.distribution.manifest.v2+json";

// ปรับได้: กันคลังบวมและกันสคริปต์รันนานเกินไป
const MAX_AUTO_MODELS = 40;
const MAX_TAGS_PER_FAMILY = 5;
// ครอบครัวที่ไม่ใช่โมเดลแชต — ข้ามตอน auto-add
const DENY = /embed|rerank|guard|moderat|bge|minilm|arctic|nomic|reader-lm|snowflake/i;
// ชื่อสวยๆ เฉพาะบางตัว (นอกนั้น prettify อัตโนมัติ)
const SPECIAL_NAMES = { "gpt-oss": "GPT-OSS", qwen3: "Qwen3", "qwen3-coder": "Qwen3-Coder", "qwen3-vl": "Qwen3-VL", phi4: "Phi-4" };

/** GB ที่ต้องใช้รันแบบสบาย = ขนาดไฟล์ + overhead (context/KV) */
function needsFromBytes(bytes) {
  const fileGB = bytes / 1e9;
  return Math.round((fileGB + Math.max(0.7, fileGB * 0.15)) * 10) / 10;
}

async function fetchManifestBytes(name, ver = "latest") {
  const res = await fetch(`${REGISTRY}/v2/library/${name}/manifests/${ver}`, { headers: { Accept: MANIFEST_ACCEPT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${name}:${ver}`);
  const m = await res.json();
  const layers = Array.isArray(m.layers) ? m.layers : [];
  const modelLayer =
    layers.find((l) => /image\.model/.test(l.mediaType || "")) ||
    layers.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0];
  if (!modelLayer || !modelLayer.size) throw new Error(`no model layer @ ${name}:${ver}`);
  return modelLayer.size;
}

async function fetchTags(name) {
  try {
    const res = await fetch(`${LIBRARY}/${name}/tags`, { headers: { "User-Agent": "local-ai-fit/1.0" } });
    if (!res.ok) return [];
    const html = await res.text();
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`/library/${esc}:([a-z0-9._-]+)`, "gi");
    const tags = new Set();
    let m;
    while ((m = re.exec(html))) tags.add(m[1]);
    return [...tags];
  } catch {
    return [];
  }
}

async function discoverLibraryNames() {
  try {
    const res = await fetch(LIBRARY, { headers: { "User-Agent": "local-ai-fit/1.0" } });
    if (!res.ok) return [];
    const html = await res.text();
    const names = new Set();
    const re = /href="\/library\/([a-z0-9._-]+)"/gi;
    let m;
    while ((m = re.exec(html))) names.add(m[1]);
    return [...names];
  } catch {
    return [];
  }
}

// ---- helper สำหรับ auto-add ----
const isSizeTag = (t) => /^\d+(?:\.\d+)?b$/i.test(t) || /^\d+(?:\.\d+)?b-a\d+(?:\.\d+)?b$/i.test(t);
const sizeNum = (t) => {
  const m = t.match(/^(\d+(?:\.\d+)?)b/i);
  return m ? parseFloat(m[1]) : 999;
};
function sizeLabel(tag) {
  const moe = tag.match(/^(\d+(?:\.\d+)?)b-a\d+(?:\.\d+)?b$/i);
  if (moe) return `${moe[1]}B MoE`;
  const m = tag.match(/^(\d+(?:\.\d+)?)b$/i);
  return m ? `${m[1]}B` : tag.toUpperCase();
}
function prettyName(name) {
  if (SPECIAL_NAMES[name]) return SPECIAL_NAMES[name];
  return name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}
function categoryFor(name) {
  const n = name.toLowerCase();
  if (/coder|code/.test(n)) return ["coding"];
  if (/r1|qwq|reason|think|marco-o1|deepseek-r/.test(n)) return ["reasoning"];
  return ["general"];
}
const AUTO_BLURB = {
  general: "โมเดลจาก Ollama library (เพิ่มอัตโนมัติ)",
  coding: "สายเขียนโค้ด (เพิ่มอัตโนมัติ)",
  reasoning: "สายคิดวิเคราะห์ (เพิ่มอัตโนมัติ)",
};
const AUTO_BLURB_EN = {
  general: "From the Ollama library (auto-added)",
  coding: "Coding model (auto-added)",
  reasoning: "Reasoning model (auto-added)",
};

async function main() {
  const seed = JSON.parse(await readFile(join(__dirname, "models.seed.json"), "utf8"));
  const out = [];
  let ok = 0;
  let fallback = 0;

  // 1) โมเดลคิวเรต
  for (const s of seed.models) {
    const model = { name: s.name, tag: s.tag, size: s.size, cats: s.cats, good: s.good, good_en: s.good_en, score: s.score, needs: s.needsFallback };
    const [name, ver] = s.tag.split(":");
    try {
      const bytes = await fetchManifestBytes(name, ver);
      model.bytes = bytes;
      model.needs = needsFromBytes(bytes);
      ok++;
      console.log(`  ✓ ${s.tag.padEnd(24)} ${(bytes / 1e9).toFixed(2)} GB -> needs ~${model.needs} GB`);
    } catch (err) {
      fallback++;
      console.warn(`  ! ${s.tag.padEnd(24)} ใช้ needsFallback (${err.message})`);
    }
    out.push(model);
  }

  // 2) auto-add โมเดลใหม่
  const known = new Set(seed.models.map((m) => m.tag.split(":")[0]));
  const found = await discoverLibraryNames();
  const candidates = found.filter((n) => !known.has(n) && !DENY.test(n));
  let added = 0;
  console.log(`\n🔎 auto-add: มีผู้สมัคร ${candidates.length} ครอบครัว (จำกัดเพิ่มไม่เกิน ${MAX_AUTO_MODELS} โมเดล)`);

  for (const name of candidates) {
    if (added >= MAX_AUTO_MODELS) break;
    const tags = await fetchTags(name);
    const sizeTags = [...new Set(tags.filter(isSizeTag))].sort((a, b) => sizeNum(a) - sizeNum(b)).slice(0, MAX_TAGS_PER_FAMILY);
    if (!sizeTags.length) continue;

    const cats = categoryFor(name);
    for (const t of sizeTags) {
      if (added >= MAX_AUTO_MODELS) break;
      try {
        const bytes = await fetchManifestBytes(name, t);
        out.push({
          name: `${prettyName(name)} ${sizeLabel(t)}`,
          tag: `${name}:${t}`,
          size: sizeLabel(t),
          cats,
          good: AUTO_BLURB[cats[0]],
          good_en: AUTO_BLURB_EN[cats[0]],
          bytes,
          needs: needsFromBytes(bytes),
          auto: true,
        });
        added++;
        console.log(`  + ${`${name}:${t}`.padEnd(24)} ${(bytes / 1e9).toFixed(2)} GB [auto/${cats[0]}]`);
      } catch {
        /* tag ดึงขนาดไม่ได้ — ข้าม */
      }
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "ollama registry (registry.ollama.ai)",
    models: out,
  };
  await mkdir(join(ROOT, "public"), { recursive: true });
  await writeFile(join(ROOT, "public", "models.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`\n✅ เขียน public/models.json — คิวเรต ${seed.models.length} (สำเร็จ ${ok}/fallback ${fallback}) · auto-add ${added}`);
}

main().catch((e) => {
  console.error("สคริปต์ล้มเหลว:", e);
  process.exit(1);
});
