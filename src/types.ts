export type Cat = "general" | "coding" | "reasoning";
export type GpuClass = "discrete" | "apple" | "integrated";
export type OS = "win" | "mac" | "linux";

export interface Model {
  name: string;
  tag: string;
  size: string;
  /** ค่าประมาณหน่วยความจำ (GB) ที่ต้องใช้รันแบบสบายที่ Q4 */
  needs: number;
  cats: Cat[];
  good: string;
  /** ขนาดไฟล์จริงจาก Ollama registry (ไบต์) — ใส่โดยสคริปต์ */
  bytes?: number;
  /** เพิ่มอัตโนมัติจาก library (ยังไม่ได้คิวเรต) */
  auto?: boolean;
}

export interface Catalog {
  generatedAt?: string;
  source?: string;
  models: Model[];
}

export interface State {
  ram: number;
  gpuClass: GpuClass;
  vram: number;
  os: OS;
  gpuName: string;
  task: Cat;
  live: boolean;
  cores?: number | null;
  ramDet?: string;
  vramDet?: string;
}

export interface Budget {
  pool: string;
  total: number;
  reserve: number;
  budget: number;
  ceil: number;
}

export interface Recommendation {
  best: Model;
  lighter: Model | null;
  heavier: Model | null;
  b: Budget;
  speed: string;
  lamp: "good" | "warn" | "bad";
  vtxt: string;
  comfy: boolean;
}
