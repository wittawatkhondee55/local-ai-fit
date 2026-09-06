import type { OS, State } from "./types";
import { classifyGPU, vramFromName } from "./gpu-table";

function detectGPUString(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) return (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) || "";
    return (gl.getParameter(gl.RENDERER) as string) || "";
  } catch {
    return "";
  }
}

export function detectOS(): OS {
  const uaData = (navigator as any).userAgentData;
  const p = (uaData?.platform || navigator.platform || navigator.userAgent || "").toLowerCase();
  if (/mac|iphone|ipad|darwin/.test(p)) return "mac";
  if (/linux|x11|android/.test(p) && !/win/.test(p)) return "linux";
  return "win";
}

/** สแกนสเปกจากบราวเซอร์ล้วน แล้วเขียนทับ state (mutate) */
export async function scan(state: State): Promise<void> {
  let gpuName = detectGPUString();
  let gcls = gpuName ? classifyGPU(gpuName) : "integrated";

  // WebGPU ให้ข้อมูล vendor/architecture เพิ่ม เมื่อบราวเซอร์รองรับ
  try {
    const gpu = (navigator as any).gpu;
    if (gpu) {
      const ad = await gpu.requestAdapter();
      if (ad?.info) {
        const info = [ad.info.vendor, ad.info.architecture, ad.info.description].filter(Boolean).join(" ");
        if (info && info.length > 2) {
          gpuName = gpuName || info;
          gcls = classifyGPU(gpuName + " " + info);
        }
      }
    }
  } catch {
    /* WebGPU ไม่รองรับ — ข้าม */
  }

  const dm = (navigator as any).deviceMemory as number | undefined; // GB, มักตันที่ 8
  if (dm) {
    state.ram = dm >= 8 ? Math.max(state.ram, 16) : dm;
    state.ramDet = dm >= 8 ? "บราวเซอร์บอก ≥8GB — โปรดยืนยัน" : `บราวเซอร์บอก ~${dm}GB`;
  } else {
    state.ramDet = "บราวเซอร์อ่านไม่ได้ — กรอกเอง";
  }

  state.gpuClass = gcls;
  state.gpuName = gpuName || "อ่านชื่อการ์ดจอไม่ได้";
  if (gcls === "discrete") {
    const v = vramFromName(gpuName);
    if (v) {
      state.vram = v;
      state.vramDet = `เดาจาก "${gpuName.slice(0, 24)}"`;
    } else {
      state.vramDet = "ไม่รู้จักรุ่นนี้ — กรอกเอง";
    }
  } else if (gcls === "apple") {
    state.vramDet = "ใช้หน่วยความจำรวมกับ RAM";
  } else {
    state.vram = 0;
    state.vramDet = "ใช้ RAM ร่วม (ไม่มี VRAM แยก)";
  }

  state.os = detectOS();
  state.cores = navigator.hardwareConcurrency || null;
  state.live = true;
}
