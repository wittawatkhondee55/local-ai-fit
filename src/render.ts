import type { Cat, Model, State } from "./types";
import { recommend } from "./recommend";
import { shortGPU } from "./gpu-table";
import { getLang, t, td, HOWTO } from "./i18n";

const $ = (id: string) => document.getElementById(id) as HTMLElement;

function gb(x: number): string {
  return (Math.round(x * 10) / 10).toString().replace(/\.0$/, "");
}
/** พื้นที่ดิสก์ที่ต้องใช้ = ขนาดไฟล์จริง (bytes) ถ้าไม่มีก็ประมาณจาก needs */
function diskGB(m: Model): number {
  return m.bytes ? m.bytes / 1e9 : m.needs * 0.85;
}
function blurb(m: Model): string {
  return getLang() === "en" ? m.good_en || m.good : m.good;
}
function chip(k: string, v: string): string {
  return `<span class="chip">${k} <b>${v}</b></span>`;
}

function fillAlt(id: string, m: Model | null, descKey: string | null, selectedTag: string, heavy = false): void {
  const el = $(id);
  if (!m) {
    el.className = "alt empty";
    delete el.dataset.tag;
    el.textContent = t(heavy ? "alt_empty_heavy" : "alt_empty_light");
    return;
  }
  const isSel = m.tag === selectedTag;
  el.className = "alt selectable" + (isSel ? " selected" : "");
  el.dataset.tag = m.tag;
  const suffix = isSel ? ` <span class="sel-suffix">${t("sel_suffix")}</span>` : "";
  el.innerHTML =
    `<div class="role">${t(heavy ? "role_heavy" : "role_light")}</div>` +
    `<div class="an"></div><div class="ad"></div>`;
  (el.querySelector(".an") as HTMLElement).innerHTML = m.name + suffix;
  (el.querySelector(".ad") as HTMLElement).textContent =
    `~${gb(m.needs)}GB · ${descKey ? t(descKey) : ""} · ollama run ${m.tag}`;
}

const CAT_KEY: Record<Cat, string> = { general: "cat_general", coding: "cat_coding", reasoning: "cat_reasoning" };

// คำสั่ง "ตรวจแบบแม่นยำ" (อ่านค่าอย่างเดียว) — เปิดหน้านี้พร้อม query ค่าจริง __O__ = origin
const CMD_WIN =
  "$k=gp 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\*' -ea 0|?{$_.'HardwareInformation.qwMemorySize'}|sort 'HardwareInformation.qwMemorySize' -desc|select -First 1;$r=[math]::Round((gcim Win32_ComputerSystem).TotalPhysicalMemory/1GB);$v=[math]::Round($k.'HardwareInformation.qwMemorySize'/1GB);start \"__O__/?ram=$r&vram=$v&gpu=$([uri]::EscapeDataString($k.DriverDesc))\"";
const CMD_MAC =
  "R=$(($(sysctl -n hw.memsize)/1073741824));G=$(system_profiler SPDisplaysDataType|awk -F': ' '/Chipset Model/{print $2;exit}'|sed 's/ /%20/g');open \"__O__/?ram=$R&gpu=$G\"";
const CMD_LINUX =
  "R=$(free -g|awk '/Mem:/{print $2}');G=$(lspci|grep -iE 'vga|3d'|head -1|sed 's/.*: //;s/ /%20/g');V=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null|head -1);V=$(( ${V:-0}/1024 ));xdg-open \"__O__/?ram=$R&vram=$V&gpu=$G\"";

function preciseCmd(os: string): string {
  const tmpl = os === "win" ? CMD_WIN : os === "mac" ? CMD_MAC : CMD_LINUX;
  return tmpl.replace("__O__", location.origin);
}

function renderCatalog(models: Model[], best: Model): void {
  const tb = $("catBody");
  tb.innerHTML = "";
  models
    .slice()
    .sort((a, b) => a.needs - b.needs)
    .forEach((m) => {
      const tr = document.createElement("tr");
      if (m === best) tr.className = "hit";
      const tags = m.cats.map((c) => t(CAT_KEY[c])).join(", ");
      const auto = m.auto ? ` <span class="auto-badge" title="auto">auto</span>` : "";
      tr.innerHTML =
        `<td class="name">${m.name}${auto}</td><td>${m.size}</td><td>~${gb(m.needs)}GB</td><td>${tags}</td>`;
      tb.appendChild(tr);
    });
}

function speedKeyFor(state: State, needs: number): string {
  if (state.gpuClass === "discrete" && needs <= state.vram) return "sp_fast";
  if (state.gpuClass === "apple") return "sp_applemid";
  if (state.gpuClass === "discrete") return "sp_mid";
  return "sp_midslow";
}

/** จับคู่ harness (Aider) กับ "โมเดลที่เลือกด้านบน" */
export function renderCodingAgent(state: State, model: Model): void {
  $("agentModel").innerHTML =
    `<b>${model.name}</b> · ${model.size} · ~${gb(model.needs)}GB · ${t(speedKeyFor(state, model.needs))}`;
  $("cmdAgentPull").textContent = "ollama pull " + model.tag;
  $("cmdAgentRun").textContent = "aider --model ollama_chat/" + model.tag;
}

export function renderRanking(models: Model[], cat: Cat): void {
  const box = $("rankList");
  box.innerHTML = "";
  const list = models
    .filter((m) => !m.auto && typeof m.score === "number" && m.cats.includes(cat))
    .sort((a, b) => (b.score as number) - (a.score as number));
  const max = list.length ? (list[0].score as number) : 100;
  list.forEach((m, i) => {
    const row = document.createElement("div");
    row.className = "rank-row" + (i < 3 ? " top" : "");
    const medal = ["🥇", "🥈", "🥉"][i] ?? String(i + 1);
    const pct = Math.max(6, ((m.score as number) / max) * 100);
    row.innerHTML =
      `<span class="rank-no">${medal}</span>` +
      `<div class="rank-main">` +
      `<div class="rank-name">${m.name}</div>` +
      `<div class="rank-bar"><div class="rank-fill" style="width:${pct}%"></div></div>` +
      `</div>` +
      `<span class="rank-score">${m.score}</span>`;
    box.appendChild(row);
  });
}

export function renderHowto(): void {
  const box = $("howtoList");
  box.innerHTML = "";
  HOWTO[getLang()].forEach((step) => {
    const div = document.createElement("div");
    div.className = "howto-step";
    div.innerHTML = `<div class="howto-t">${step.t}</div><div class="howto-b">${step.b}</div>`;
    box.appendChild(div);
  });
}

export function renderAll(state: State, models: Model[], generatedAt?: string, selectedTag?: string): Model {
  const r = recommend(state, models);
  const b = r.b;
  const m = r.best;

  const options = [r.best, r.lighter, r.heavier].filter(Boolean) as Model[];
  const sel = options.find((o) => o.tag === selectedTag) ?? r.best;

  const recoCard = $("recoCard");
  recoCard.dataset.tag = r.best.tag;
  recoCard.classList.toggle("selected", sel === r.best);
  $("mActive").hidden = sel !== r.best;

  $("verdictText").textContent = t(r.vkey);
  ($("verdict").querySelector(".lamp") as HTMLElement).className = "lamp lamp-" + r.lamp;
  $("mName").textContent = m.name;
  $("mDesc").textContent = blurb(m);
  $("mChips").innerHTML =
    chip(t("chip_size"), m.size) +
    chip(t("chip_speed"), t(r.speedKey)) +
    chip(t("chip_cmd"), m.tag);

  // แถบความต้องการระบบ (แบบ system requirements)
  $("reqs").innerHTML =
    `<span class="req"><span class="req-ic">💾</span> ${t("req_disk")}: <b>~${gb(diskGB(m))} GB</b></span>` +
    `<span class="req"><span class="req-ic">🧠</span> ${t("req_ram")}: <b>~${gb(m.needs)} GB</b></span>`;

  const used = Math.min(m.needs, b.total);
  const pct = Math.max(4, Math.min(100, b.total ? (used / b.total) * 100 : 100));
  const seg = $("segModel");
  seg.style.width = pct + "%";
  seg.className = "seg seg-model" + (m.needs > b.budget ? " warn" : "");
  $("gaugePool").textContent = t("gauge_pool", { pool: t(b.pool) });
  const free = Math.max(b.total - m.needs, 0);
  $("gaugeNums").textContent = t("gauge_nums", { used: gb(used), total: gb(b.total), free: gb(free) });

  fillAlt("altLight", r.lighter, "alt_desc_light", sel.tag);
  fillAlt("altHeavy", r.heavier, r.heavier ? "alt_desc_heavy" : null, sel.tag, true);

  // ขั้นตอนติดตั้ง — ใช้ตัวที่เลือก (sel) ขับ
  const inst =
    state.os === "win"
      ? "winget install Ollama.Ollama"
      : state.os === "mac"
      ? "brew install --cask ollama"
      : "curl -fsSL https://ollama.com/install.sh | sh";
  $("cmdInstall").textContent = inst;
  $("installAlt").innerHTML = t(
    state.os === "win" ? "install_alt_win_html" : state.os === "mac" ? "install_alt_mac_html" : "install_alt_linux_html",
  );
  $("cmdRun").textContent = "ollama run " + sel.tag;
  $("step2Title").innerHTML = t("step2_title", { name: sel.name, size: gb(diskGB(sel)) });
  $("cmdPrecise").textContent = preciseCmd(state.os);

  const osLabel = state.os === "win" ? "Windows" : state.os === "mac" ? "macOS" : "Linux";
  $("osLine").textContent =
    osLabel +
    (state.cores ? ` · ${state.cores} cores` : "") +
    (state.gpuName ? ` · ${shortGPU(state.gpuName)}` : "");
  const badge = $("stateBadge");
  badge.textContent = t(state.live ? "badge_live" : "badge_example");
  badge.className = "badge-ex" + (state.live ? " badge-live" : "");
  $("ramDet").textContent = td(state.ramDet);
  $("vramDet").textContent = td(state.vramDet);
  $("vramField").hidden = state.gpuClass !== "discrete";

  if (generatedAt) {
    const d = new Date(generatedAt);
    if (!isNaN(d.getTime())) $("genAt").textContent = t("gen_at", { date: d.toISOString().slice(0, 10) });
  }

  renderCatalog(models, m);
  return sel;
}

/** sync ค่า state -> input ในฟอร์ม */
export function syncInputs(state: State): void {
  ($("ram") as HTMLInputElement).value = String(state.ram);
  ($("vram") as HTMLInputElement).value = String(state.vram);
  ($("gpuClass") as HTMLSelectElement).value = state.gpuClass;
  ($("os") as HTMLSelectElement).value = state.os;
}
