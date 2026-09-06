import "./styles.css";
import type { Cat, GpuClass, Model, OS, State } from "./types";
import { FALLBACK_MODELS, loadCatalog } from "./catalog";
import { scan } from "./detect";
import { renderAll, syncInputs } from "./render";
import { initTheme } from "./theme";

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

// เริ่มด้วย fallback ให้หน้าวาดได้ทันที แล้วค่อยแทนด้วย models.json
let models: Model[] = FALLBACK_MODELS;
let generatedAt: string | undefined;

function render(): void {
  renderAll(state, models, generatedAt);
}

function wire(): void {
  $("scanBtn").addEventListener("click", async () => {
    await scan(state);
    syncInputs(state);
    render();
    document.querySelector(".sec-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ($("ram") as HTMLInputElement).addEventListener("input", (e) => {
    state.ram = Math.max(1, +(e.target as HTMLInputElement).value || 1);
    state.ramDet = "ตั้งค่าเอง";
    render();
  });
  ($("vram") as HTMLInputElement).addEventListener("input", (e) => {
    state.vram = Math.max(0, +(e.target as HTMLInputElement).value || 0);
    state.vramDet = "ตั้งค่าเอง";
    render();
  });
  ($("gpuClass") as HTMLSelectElement).addEventListener("change", (e) => {
    state.gpuClass = (e.target as HTMLSelectElement).value as GpuClass;
    if (state.gpuClass !== "discrete") state.vram = state.gpuClass === "apple" ? state.ram : 0;
    syncInputs(state);
    render();
  });
  ($("os") as HTMLSelectElement).addEventListener("change", (e) => {
    state.os = (e.target as HTMLSelectElement).value as OS;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("#taskTabs .tab").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll("#taskTabs .tab").forEach((x) => x.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      state.task = t.dataset.task as Cat;
      render();
    });
  });

  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest?.(".copy") as HTMLButtonElement | null;
    if (!btn) return;
    const target = btn.dataset.target;
    if (!target) return;
    const txt = $(target).textContent || "";
    const done = () => {
      btn.textContent = "คัดลอกแล้ว ✓";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = "คัดลอก";
        btn.classList.remove("done");
      }, 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(txt).then(done, done);
    } else {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        done();
      } catch {
        /* ไม่รองรับ clipboard */
      }
    }
  });
}

async function init(): Promise<void> {
  initTheme();
  wire();
  syncInputs(state);
  render(); // วาดด้วย fallback ก่อน กันหน้าว่าง
  const cat = await loadCatalog();
  models = cat.models;
  generatedAt = cat.generatedAt;
  render();
}

init();
