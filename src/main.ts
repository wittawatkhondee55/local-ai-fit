import "./styles.css";
import type { Cat, GpuClass, Model, OS, State } from "./types";
import { FALLBACK_MODELS, loadCatalog } from "./catalog";
import { scan, detectOS } from "./detect";
import { classifyGPU } from "./gpu-table";
import { renderAll, renderHowto, syncInputs } from "./render";
import { initTheme } from "./theme";
import { applyStatic, getLang, setLang, t, type Lang } from "./i18n";

const $ = (id: string) => document.getElementById(id) as HTMLElement;

// สถานะเริ่มต้น = ตัวอย่างเครื่องจริง (16GB + RTX 3060) ให้เห็นผลทันทีตั้งแต่เปิด
const state: State = {
  ram: 16,
  gpuClass: "discrete",
  vram: 12,
  os: "win",
  gpuName: "NVIDIA GeForce RTX 3060",
  task: "general",
  live: false,
};

let models: Model[] = FALLBACK_MODELS;
let generatedAt: string | undefined;
let selectedTag: string | undefined;

function render(): void {
  renderAll(state, models, generatedAt, selectedTag);
}
function updateLangBtn(): void {
  $("langBtn").textContent = getLang() === "th" ? "EN" : "ไทย";
}
function applyAll(): void {
  applyStatic();
  renderHowto();
  updateLangBtn();
  render();
}

function copyToClipboard(txt: string, onDone: () => void): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(txt).then(onDone, onDone);
  } else {
    try {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      onDone();
    } catch {
      /* ไม่รองรับ clipboard */
    }
  }
}

function wire(): void {
  $("langBtn").addEventListener("click", () => {
    setLang(getLang() === "th" ? "en" : ("th" as Lang));
    applyAll();
  });

  $("scanBtn").addEventListener("click", async () => {
    await scan(state);
    selectedTag = undefined;
    syncInputs(state);
    render();
    document.querySelector(".sec-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ($("ram") as HTMLInputElement).addEventListener("input", (e) => {
    state.ram = Math.max(1, +(e.target as HTMLInputElement).value || 1);
    state.ramDet = { k: "det_set_manual" };
    selectedTag = undefined;
    render();
  });
  ($("vram") as HTMLInputElement).addEventListener("input", (e) => {
    state.vram = Math.max(0, +(e.target as HTMLInputElement).value || 0);
    state.vramDet = { k: "det_set_manual" };
    selectedTag = undefined;
    render();
  });
  ($("gpuClass") as HTMLSelectElement).addEventListener("change", (e) => {
    state.gpuClass = (e.target as HTMLSelectElement).value as GpuClass;
    if (state.gpuClass !== "discrete") state.vram = state.gpuClass === "apple" ? state.ram : 0;
    selectedTag = undefined;
    syncInputs(state);
    render();
  });
  ($("os") as HTMLSelectElement).addEventListener("change", (e) => {
    state.os = (e.target as HTMLSelectElement).value as OS;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("#taskTabs .tab").forEach((t2) => {
    t2.addEventListener("click", () => {
      document.querySelectorAll("#taskTabs .tab").forEach((x) => x.setAttribute("aria-selected", "false"));
      t2.setAttribute("aria-selected", "true");
      state.task = t2.dataset.task as Cat;
      selectedTag = undefined;
      render();
    });
  });

  // เลือกตัวติดตั้ง
  ["recoCard", "altLight", "altHeavy"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.tabIndex = 0;
      el.setAttribute("role", "button");
    }
  });
  function pick(target: HTMLElement | null): void {
    const card = target?.closest?.("[data-tag].selectable") as HTMLElement | null;
    const tag = card?.dataset.tag;
    if (!tag) return;
    selectedTag = tag;
    render();
    $("cmdRun").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  document.addEventListener("click", (e) => pick(e.target as HTMLElement));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!(e.target as HTMLElement).closest?.("[data-tag].selectable")) return;
    e.preventDefault();
    pick(e.target as HTMLElement);
  });

  // ปุ่มคัดลอกทีละคำสั่ง
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest?.(".copy") as HTMLButtonElement | null;
    if (!btn || !btn.dataset.target) return;
    const txt = $(btn.dataset.target).textContent || "";
    copyToClipboard(txt, () => {
      btn.textContent = t("copied");
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = t("copy");
        btn.classList.remove("done");
      }, 1600);
    });
  });

  // ปุ่มคัดลอกทั้งชุด (ติดตั้ง + รัน)
  $("copyAll").addEventListener("click", () => {
    const all = `${$("cmdInstall").textContent}\n${$("cmdRun").textContent}`;
    const btn = $("copyAll");
    copyToClipboard(all, () => {
      btn.textContent = t("copyall_done");
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = t("copyall");
        btn.classList.remove("done");
      }, 1600);
    });
  });
}

/** อ่านค่าที่คำสั่ง "ตรวจแบบแม่นยำ" ส่งกลับมาทาง query (?ram=&vram=&gpu=) */
function readPreciseParams(): boolean {
  const p = new URLSearchParams(location.search);
  if (!["ram", "vram", "gpu"].some((k) => p.has(k))) return false;

  const ram = parseFloat(p.get("ram") || "");
  if (ram > 0) state.ram = Math.round(ram);

  const gpu = p.get("gpu");
  if (gpu) {
    state.gpuName = gpu;
    state.gpuClass = classifyGPU(gpu);
  }
  const vram = parseFloat(p.get("vram") || "");
  if (state.gpuClass === "apple") {
    state.vram = state.ram;
  } else if (!isNaN(vram) && vram > 0) {
    state.vram = Math.round(vram);
    if (vram >= 3) state.gpuClass = "discrete";
  }

  state.os = detectOS();
  state.live = true;
  state.ramDet = { k: "det_precise" };
  state.vramDet = { k: "det_precise" };
  try {
    history.replaceState(null, "", location.pathname);
  } catch {
    /* ignore */
  }
  return true;
}

async function init(): Promise<void> {
  initTheme();
  wire();
  const precise = readPreciseParams();
  applyAll(); // แปลภาษา + วาดครั้งแรกด้วย fallback
  syncInputs(state);
  if (precise) document.querySelector(".sec-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const cat = await loadCatalog();
  models = cat.models;
  generatedAt = cat.generatedAt;
  render();
}

init();
