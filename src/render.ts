import type { Cat, Model, State } from "./types";
import { recommend } from "./recommend";
import { shortGPU } from "./gpu-table";

const $ = (id: string) => document.getElementById(id) as HTMLElement;

function gb(x: number): string {
  return (Math.round(x * 10) / 10).toString().replace(/\.0$/, "");
}
function chip(k: string, v: string): string {
  return `<span class="chip">${k} <b>${v}</b></span>`;
}
function fillAlt(id: string, m: Model | null, desc: string | null, heavy = false): void {
  const el = $(id);
  if (!m) {
    el.className = "alt empty";
    el.textContent = heavy ? "เครื่องนี้จัดเต็มกว่านี้ไม่ไหวแล้ว 👍" : "— ไม่มีรุ่นเบากว่านี้";
    return;
  }
  el.className = "alt";
  el.innerHTML =
    `<div class="role">${heavy ? "จัดเต็ม · ถ้ายอมช้าลง" : "เบากว่า · ลื่นสุด"}</div>` +
    `<div class="an"></div><div class="ad"></div>`;
  (el.querySelector(".an") as HTMLElement).textContent = m.name;
  (el.querySelector(".ad") as HTMLElement).textContent = `~${gb(m.needs)}GB · ${desc} · ollama run ${m.tag}`;
}

const CAT_TH: Record<Cat, string> = { general: "ทั่วไป", coding: "โค้ด", reasoning: "เหตุผล" };

function renderCatalog(models: Model[], best: Model): void {
  const tb = $("catBody");
  tb.innerHTML = "";
  models
    .slice()
    .sort((a, b) => a.needs - b.needs)
    .forEach((m) => {
      const tr = document.createElement("tr");
      if (m === best) tr.className = "hit";
      const tags = m.cats.map((c) => CAT_TH[c] ?? c).join(", ");
      tr.innerHTML =
        `<td class="name">${m.name}</td><td>${m.size}</td><td>~${gb(m.needs)}GB</td><td>${tags}</td>`;
      tb.appendChild(tr);
    });
}

export function renderAll(state: State, models: Model[], generatedAt?: string): void {
  const r = recommend(state, models);
  const b = r.b;
  const m = r.best;

  $("verdictText").textContent = r.vtxt;
  ($("verdict").querySelector(".lamp") as HTMLElement).className = "lamp lamp-" + r.lamp;
  $("mName").textContent = m.name;
  $("mDesc").textContent = m.good;
  $("mChips").innerHTML =
    chip("ขนาด", m.size) +
    chip("ใช้หน่วยความจำ", "~" + gb(m.needs) + "GB") +
    chip("ความเร็ว", r.speed) +
    chip("คำสั่ง", m.tag);

  const used = Math.min(m.needs, b.total);
  const pct = Math.max(4, Math.min(100, b.total ? (used / b.total) * 100 : 100));
  const seg = $("segModel");
  seg.style.width = pct + "%";
  seg.className = "seg seg-model" + (m.needs > b.budget ? " warn" : "");
  $("gaugePool").textContent = `หน่วยความจำที่ใช้ (${b.pool})`;
  const free = Math.max(b.total - m.needs, 0);
  $("gaugeNums").textContent = `ใช้ ~${gb(used)} / ${gb(b.total)}GB · เหลือ ~${gb(free)}GB`;

  fillAlt("altLight", r.lighter, "ลื่นที่สุด เหลือเครื่องว่างเยอะ");
  fillAlt("altHeavy", r.heavier, r.heavier ? "ล้นเข้าแรม จะช้าลงแต่ฉลาดกว่า" : null, true);

  const inst =
    state.os === "win"
      ? "winget install Ollama.Ollama"
      : state.os === "mac"
      ? "brew install --cask ollama"
      : "curl -fsSL https://ollama.com/install.sh | sh";
  $("cmdInstall").textContent = inst;
  $("installAlt").innerHTML =
    state.os === "win"
      ? 'ไม่มี winget? โหลดตัวติดตั้ง <a href="https://ollama.com/download/windows" target="_blank" rel="noopener">ollama.com/download/windows</a>'
      : state.os === "mac"
      ? 'หรือโหลดแอป <a href="https://ollama.com/download/mac" target="_blank" rel="noopener">ollama.com/download/mac</a>'
      : "รองรับ Ubuntu/Debian/Fedora ฯลฯ";
  $("cmdRun").textContent = "ollama run " + m.tag;
  $("dlSize").textContent = "~" + gb(m.needs);

  const osLabel = state.os === "win" ? "Windows" : state.os === "mac" ? "macOS" : "Linux";
  $("osLine").textContent =
    osLabel +
    (state.cores ? ` · ${state.cores} cores` : "") +
    (state.gpuName ? ` · ${shortGPU(state.gpuName)}` : "");
  const badge = $("stateBadge");
  badge.textContent = state.live ? "สแกนจริง" : "ค่าตัวอย่าง";
  badge.className = "badge-ex" + (state.live ? " badge-live" : "");
  $("ramDet").textContent = state.ramDet ?? "";
  $("vramDet").textContent = state.vramDet ?? "";
  $("vramField").hidden = state.gpuClass !== "discrete";

  if (generatedAt) {
    const d = new Date(generatedAt);
    if (!isNaN(d.getTime())) $("genAt").textContent = `· อัปเดตล่าสุด ${d.toISOString().slice(0, 10)}`;
  }

  renderCatalog(models, m);
}

/** sync ค่า state -> input ในฟอร์ม */
export function syncInputs(state: State): void {
  ($("ram") as HTMLInputElement).value = String(state.ram);
  ($("vram") as HTMLInputElement).value = String(state.vram);
  ($("gpuClass") as HTMLSelectElement).value = state.gpuClass;
  ($("os") as HTMLSelectElement).value = state.os;
}
