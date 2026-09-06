import type { Budget, Cat, Model, Recommendation, State } from "./types";

/** งบหน่วยความจำ โดยกันที่ว่างไว้ให้ระบบ/งานอื่น ไม่จัดเต็มจนเครื่องหน่วง */
export function computeBudget(s: State): Budget {
  let pool: string, total: number, reserve: number, ceil: number;
  if (s.gpuClass === "discrete" && s.vram > 0) {
    pool = "VRAM";
    total = s.vram;
    reserve = Math.min(Math.max(s.vram * 0.15, 0.8), 3);
    ceil = Math.min(s.ram - 3, s.ram * 0.7); // ล้นเข้า RAM ได้ (ช้าลง)
  } else if (s.gpuClass === "apple") {
    pool = "หน่วยความจำรวม";
    total = s.ram;
    reserve = Math.max(4, s.ram * 0.35);
    ceil = total - reserve;
  } else {
    pool = "RAM";
    total = s.ram;
    reserve = Math.max(4, s.ram * 0.4);
    ceil = Math.max(total - 3, total * 0.75);
  }
  return { pool, total, reserve, budget: Math.max(total - reserve, 0.5), ceil };
}

function poolFor(models: Model[], task: Cat): Model[] {
  // แนะนำจากรายการคิวเรตเท่านั้น (ข้ามตัว auto) เพื่อคุมคุณภาพคำแนะนำ
  const curated = models.filter((m) => !m.auto);
  const base = curated.length >= 3 ? curated : models;
  let list = base.filter((m) => m.cats.includes(task));
  if (list.length < 3) list = base.filter((m) => m.cats.includes("general") || m.cats.includes(task));
  return list.slice().sort((a, b) => a.needs - b.needs);
}

export function recommend(s: State, models: Model[]): Recommendation {
  const b = computeBudget(s);
  const list = poolFor(models, s.task);
  const fits = list.filter((m) => m.needs <= b.budget);
  const best = fits.length ? fits[fits.length - 1] : list[0];
  const comfy = fits.length > 0;

  let lighter: Model | null = null;
  for (let i = fits.length - 2; i >= 0; i--) {
    if (fits[i].needs <= b.budget * 0.55) {
      lighter = fits[i];
      break;
    }
  }
  if (!lighter && fits.length > 1) lighter = fits[fits.length - 2];
  if (!lighter) lighter = list[0];

  let heavier: Model | null = null;
  for (const m of list) {
    if (m.needs > b.budget && m.needs <= b.ceil) heavier = m;
    if (m.needs > b.ceil) break;
  }

  let lamp: Recommendation["lamp"], vtxt: string, speed: string;
  if (!comfy) {
    lamp = "bad";
    vtxt = "เครื่องค่อนข้างจำกัด — เริ่มจากรุ่นเล็ก";
    speed = "พอไหว";
  } else if (s.gpuClass === "discrete" && best.needs <= s.vram) {
    lamp = "good";
    vtxt = "รันได้สบาย · เร่งด้วยการ์ดจอ";
    speed = "เร็ว ⚡";
  } else if (s.gpuClass === "apple") {
    lamp = "good";
    vtxt = "รันได้ดี · เร่งด้วย Metal";
    speed = "เร็ว–ปานกลาง";
  } else if (s.gpuClass === "discrete") {
    lamp = "warn";
    vtxt = "รันได้ แต่โมเดลล้นเข้าแรม จะช้าลง";
    speed = "ปานกลาง";
  } else {
    lamp = "warn";
    vtxt = "รันบน CPU ได้ · จะช้ากว่ามีการ์ดจอ";
    speed = "ปานกลาง–ช้า";
  }

  return {
    best,
    lighter: lighter && lighter !== best ? lighter : null,
    heavier,
    b,
    speed,
    lamp,
    vtxt,
    comfy,
  };
}
