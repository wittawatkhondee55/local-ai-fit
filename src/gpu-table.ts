import type { GpuClass } from "./types";

/** ตารางเทียบชื่อรุ่นการ์ดจอ -> VRAM (GB) เดาจาก substring */
export const GPU_VRAM: Array<[RegExp, number]> = [
  [/rtx\s*50?90/i, 32], [/rtx\s*5080/i, 16], [/rtx\s*5070\s*ti/i, 16], [/rtx\s*5070/i, 12], [/rtx\s*5060\s*ti/i, 16], [/rtx\s*5060/i, 8],
  [/rtx\s*4090/i, 24], [/rtx\s*4080/i, 16], [/rtx\s*4070\s*ti/i, 12], [/rtx\s*4070/i, 12], [/rtx\s*4060\s*ti/i, 8], [/rtx\s*4060/i, 8],
  [/rtx\s*3090/i, 24], [/rtx\s*3080\s*ti/i, 12], [/rtx\s*3080/i, 10], [/rtx\s*3070/i, 8], [/rtx\s*3060\s*ti/i, 8], [/rtx\s*3060/i, 12], [/rtx\s*3050/i, 8],
  [/rtx\s*2080/i, 11], [/rtx\s*2070/i, 8], [/rtx\s*2060/i, 6], [/gtx\s*1660/i, 6], [/gtx\s*1650/i, 4], [/gtx\s*1060/i, 6], [/gtx\s*1050/i, 4],
  [/rx\s*7900\s*xtx/i, 24], [/rx\s*7900\s*xt/i, 20], [/rx\s*7800/i, 16], [/rx\s*7700/i, 12], [/rx\s*7600/i, 8],
  [/rx\s*6900/i, 16], [/rx\s*6800/i, 16], [/rx\s*6700/i, 12], [/rx\s*6600/i, 8], [/rx\s*6500/i, 4],
  [/a100/i, 40], [/a6000/i, 48], [/tesla\s*t4/i, 16], [/quadro/i, 8],
];

export function vramFromName(name: string): number | null {
  for (const [re, gb] of GPU_VRAM) if (re.test(name)) return gb;
  return null;
}

export function classifyGPU(name: string): GpuClass {
  const n = name.toLowerCase();
  if (/apple|\bm1\b|\bm2\b|\bm3\b|\bm4\b/.test(n)) return "apple";
  if (/nvidia|geforce|rtx|gtx|quadro|tesla|radeon|\brx\b|amd/.test(n)) return "discrete";
  if (/intel|iris|uhd|hd graphics|adreno|mali|integrated/.test(n)) return "integrated";
  return "discrete";
}

export function shortGPU(n: string): string {
  return n
    .replace(/\(R\)|\(TM\)|Corporation|Graphics|Direct3D.*$/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}
