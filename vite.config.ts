import { defineConfig } from "vite";

// ตั้ง base ผ่าน env ตอน deploy บน subpath (เช่น GitHub Pages: BASE=/local-ai-fit/)
// ค่าปกติ "/" ใช้กับ Vercel / Netlify / Cloudflare Pages ได้เลย
export default defineConfig({
  base: process.env.BASE ?? "/",
  build: {
    target: "es2019",
    outDir: "dist",
  },
});
