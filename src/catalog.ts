import type { Catalog, Model } from "./types";

/**
 * รายชื่อสำรอง (fallback) ใช้เมื่อโหลด models.json ไม่ได้
 * ตัวจริงจะถูกเขียนทับด้วยไฟล์ที่สคริปต์ scripts/fetch-models.mjs สร้าง
 */
export const FALLBACK_MODELS: Model[] = [
  { name: "Qwen2.5 0.5B", tag: "qwen2.5:0.5b", size: "0.5B", needs: 0.8, cats: ["general"], good: "จิ๋ว รันได้ทุกเครื่อง" },
  { name: "Llama 3.2 1B", tag: "llama3.2:1b", size: "1B", needs: 1.3, cats: ["general"], good: "เบามาก ตอบไว" },
  { name: "Qwen2.5-Coder 1.5B", tag: "qwen2.5-coder:1.5b", size: "1.5B", needs: 1.7, cats: ["coding"], good: "เติมโค้ดเครื่องเล็ก" },
  { name: "Llama 3.2 3B", tag: "llama3.2:3b", size: "3B", needs: 3.0, cats: ["general"], good: "แชตทั่วไปคุ้มค่า" },
  { name: "Gemma 3 4B", tag: "gemma3:4b", size: "4B", needs: 3.6, cats: ["general"], good: "เล็กแต่ฉลาด อ่านภาพได้" },
  { name: "DeepSeek-R1 7B", tag: "deepseek-r1:7b", size: "7B", needs: 5.8, cats: ["reasoning"], good: "คิดเป็นขั้นตอน" },
  { name: "Qwen2.5 7B", tag: "qwen2.5:7b", size: "7B", needs: 5.5, cats: ["general"], good: "สมดุลดี ไทยโอเค" },
  { name: "Qwen2.5-Coder 7B", tag: "qwen2.5-coder:7b", size: "7B", needs: 5.5, cats: ["coding"], good: "โค้ดดิ้งตัวคุ้ม" },
  { name: "Llama 3.1 8B", tag: "llama3.1:8b", size: "8B", needs: 6.0, cats: ["general"], good: "อเนกประสงค์ยอดฮิต" },
  { name: "Gemma 3 12B", tag: "gemma3:12b", size: "12B", needs: 8.5, cats: ["general"], good: "ฉลาดขึ้นชัด" },
  { name: "Qwen2.5-Coder 14B", tag: "qwen2.5-coder:14b", size: "14B", needs: 9.5, cats: ["coding"], good: "โค้ดระดับจริงจัง" },
  { name: "Qwen2.5 14B", tag: "qwen2.5:14b", size: "14B", needs: 9.5, cats: ["general"], good: "เก่งขึ้น รอบรู้" },
  { name: "DeepSeek-R1 14B", tag: "deepseek-r1:14b", size: "14B", needs: 9.5, cats: ["reasoning"], good: "เหตุผลแน่นขึ้น" },
  { name: "Gemma 3 27B", tag: "gemma3:27b", size: "27B", needs: 18, cats: ["general"], good: "ระดับท็อปที่ยังรันเครื่องเดียวได้" },
  { name: "Qwen2.5 32B", tag: "qwen2.5:32b", size: "32B", needs: 21, cats: ["general"], good: "ใกล้เคียงตัวใหญ่" },
  { name: "Qwen2.5-Coder 32B", tag: "qwen2.5-coder:32b", size: "32B", needs: 21, cats: ["coding"], good: "โค้ดดิ้งตัวท็อป" },
  { name: "DeepSeek-R1 32B", tag: "deepseek-r1:32b", size: "32B", needs: 21, cats: ["reasoning"], good: "คิดหนักแม่นยำ" },
  { name: "Llama 3.3 70B", tag: "llama3.3:70b", size: "70B", needs: 43, cats: ["general"], good: "คุณภาพระดับสูงสุด" },
  { name: "DeepSeek-R1 70B", tag: "deepseek-r1:70b", size: "70B", needs: 43, cats: ["reasoning"], good: "เหตุผลระดับสูงสุด" },
];

/** โหลด models.json (สร้างจาก Ollama registry) — ถ้าพลาดใช้ FALLBACK_MODELS */
export async function loadCatalog(): Promise<Catalog> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}models.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Catalog;
    if (Array.isArray(data.models) && data.models.length) return data;
    throw new Error("empty");
  } catch {
    return { models: FALLBACK_MODELS, source: "fallback (โหลด models.json ไม่ได้)" };
  }
}
