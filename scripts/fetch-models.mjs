#!/usr/bin/env node
/**
 * ดึงขนาดจริงของแต่ละโมเดลจาก Ollama registry (Docker v2 manifest)
 * แล้วสร้าง public/models.json ให้เว็บอ่านตอนรัน
 *
 * - แหล่งขนาด: https://registry.ollama.ai/v2/library/<name>/manifests/<tag>
 *   layer ที่เป็น "image.model" คือไฟล์น้ำหนักโมเดล -> ใช้ประมาณ RAM ที่ต้องใช้
 * - discovery: ดึงหน้า https://ollama.com/library มาหาชื่อโมเดลใหม่ที่ยังไม่มีใน seed (แจ้งเตือนเฉยๆ)
 * - ถ้าดึงขนาดไม่ได้ ใช้ needsFallback จาก seed แทน (ไม่ทำให้ทั้งไฟล์พัง)
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

/** GB ที่ต้องใช้รันแบบสบาย = ขนาดไฟล์ + overhead (context/KV) */
function needsFromBytes(bytes) {
  const fileGB = bytes / 1e9;
  const needs = fileGB + Math.max(0.7, fileGB * 0.15);
  return Math.round(needs * 10) / 10;
}

async function fetchManifestBytes(tag) {
  const [name, ver = "latest"] = tag.split(":");
  const url = `${REGISTRY}/v2/library/${name}/manifests/${ver}`;
  const res = await fetch(url, { headers: { Accept: MANIFEST_ACCEPT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${name}:${ver}`);
  const m = await res.json();
  const layers = Array.isArray(m.layers) ? m.layers : [];
  const modelLayer = layers.find((l) => /image\.model/.test(l.mediaType || "")) ||
    layers.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0];
  if (!modelLayer || !modelLayer.size) throw new Error(`no model layer @ ${tag}`);
  return modelLayer.size;
}

/** best-effort: หาชื่อโมเดลทั้งหมดในหน้า library (ไว้เตือนว่ามีตัวใหม่) */
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

async function main() {
  const seedRaw = await readFile(join(__dirname, "models.seed.json"), "utf8");
  const seed = JSON.parse(seedRaw);
  const out = [];
  let ok = 0;
  let fallback = 0;

  for (const s of seed.models) {
    const model = { name: s.name, tag: s.tag, size: s.size, cats: s.cats, good: s.good, needs: s.needsFallback };
    try {
      const bytes = await fetchManifestBytes(s.tag);
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

  // discovery — เตือนโมเดลใหม่ที่ยังไม่มีใน seed
  const known = new Set(seed.models.map((m) => m.tag.split(":")[0]));
  const found = await discoverLibraryNames();
  const missing = found.filter((n) => !known.has(n));
  if (missing.length) {
    console.log(`\n📦 พบโมเดลใน library ที่ยังไม่มีใน seed (${missing.length}): ${missing.slice(0, 30).join(", ")}`);
    console.log("   เพิ่มลง scripts/models.seed.json พร้อมหมวด + คำอธิบายไทย แล้วรันสคริปต์ใหม่");
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "ollama registry (registry.ollama.ai)",
    models: out,
  };
  await mkdir(join(ROOT, "public"), { recursive: true });
  await writeFile(join(ROOT, "public", "models.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`\n✅ เขียน public/models.json (${out.length} โมเดล · ดึงสำเร็จ ${ok} · fallback ${fallback})`);
}

main().catch((e) => {
  console.error("สคริปต์ล้มเหลว:", e);
  process.exit(1);
});
