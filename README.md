# รัน AI ตัวไหนไหว · Local AI Fit Finder

เว็บ **static** ที่สแกนสเปกเครื่องผ่านบราวเซอร์ล้วน แล้วแนะนำโมเดล Local LLM (ผ่าน [Ollama](https://ollama.com)) ที่ **รันได้สบายโดยไม่ทำเครื่องหน่วง** — พร้อมคำสั่งติดตั้งกดคัดลอกใช้ได้ทันที

- 🔒 ทำงานในเครื่องผู้ใช้ 100% ไม่มีการส่งข้อมูลออก
- 🧠 คำนวณ "งบหน่วยความจำแบบเผื่อที่ว่าง" — เลือกโมเดลใหญ่สุดที่ยังอยู่ในงบ ไม่จัดเต็มจนแรมเต็ม
- 🔄 รายชื่อ + ขนาดโมเดลดึงจาก **Ollama registry อัตโนมัติ** (ผ่านสคริปต์ + GitHub Action)
- ⚡ ไม่มี backend — deploy ฟรีได้ทุกที่

## Tech stack

| ส่วน | ใช้ |
|------|-----|
| Build | [Vite](https://vitejs.dev) 5 |
| ภาษา | TypeScript (strict) |
| Runtime | บราวเซอร์ล้วน (WebGL / WebGPU / `navigator.deviceMemory`) |
| ข้อมูลโมเดล | `public/models.json` สร้างจาก Ollama registry |

## เริ่มพัฒนา

```bash
npm install
npm run dev        # เปิด dev server
npm run build      # type-check + build ไป dist/
npm run preview    # ดู build จริง
```

## อัปเดตรายชื่อโมเดล

ขนาดโมเดลดึงสดจาก Ollama registry (Docker v2 manifest) แล้วคำนวณ RAM ที่ต้องใช้:

```bash
npm run fetch-models   # -> เขียนทับ public/models.json
```

- **เลือกว่าจะเอาโมเดลไหน / หมวด / คำอธิบายไทย** แก้ที่ [`scripts/models.seed.json`](scripts/models.seed.json)
- **ขนาด (`bytes`, `needs`)** สคริปต์เติมให้อัตโนมัติ — ถ้าดึงไม่ได้ใช้ `needsFallback`
- สคริปต์ยัง **สแกน `ollama.com/library` หาโมเดลใหม่** ที่ยังไม่มีใน seed แล้วแจ้งเตือนให้เพิ่ม
- [`.github/workflows/update-models.yml`](.github/workflows/update-models.yml) รันทุกสัปดาห์ + commit อัตโนมัติ

> เว็บอ่าน `public/models.json` (same-origin) ตอนรัน ไม่ได้เรียก registry โดยตรง (registry ไม่มี CORS) — อัปเดต = รันสคริปต์แล้ว deploy ใหม่

## โครงไฟล์

```
local-ai-fit/
├─ index.html                  # โครงหน้า
├─ public/models.json          # ข้อมูลโมเดล (generated, commit ไว้)
├─ scripts/
│  ├─ models.seed.json         # คิวเรตเอง: โมเดล + หมวด + คำอธิบายไทย
│  └─ fetch-models.mjs         # ดึงขนาดจาก Ollama registry -> models.json
├─ src/
│  ├─ main.ts                  # bootstrap + event
│  ├─ detect.ts                # สแกนสเปกจากบราวเซอร์
│  ├─ gpu-table.ts             # เทียบชื่อการ์ดจอ -> VRAM
│  ├─ recommend.ts             # ตรรกะงบหน่วยความจำ + คำแนะนำ
│  ├─ catalog.ts               # โหลด models.json (+ fallback)
│  ├─ render.ts                # วาด DOM
│  ├─ types.ts
│  └─ styles.css
└─ .github/workflows/update-models.yml
```

## Deploy

Build ได้ static ล้วนใน `dist/` วางที่ไหนก็ได้:

| แพลตฟอร์ม | คำสั่ง / ตั้งค่า |
|-----------|------------------|
| **Vercel** | import repo → framework `Vite` → เสร็จ |
| **Netlify** | build `npm run build` · publish `dist` |
| **Cloudflare Pages** | build `npm run build` · output `dist` |
| **GitHub Pages** | `BASE=/<repo>/ npm run build` แล้ว deploy `dist/` (ตั้ง `BASE` ให้ตรง subpath) |

## ตรรกะการแนะนำ (สรุป)

1. หา **pool** ที่ตัดสิน: การ์ดจอแยก → VRAM · Apple Silicon → หน่วยความจำรวม · อื่นๆ → RAM (CPU)
2. กันที่ว่างไว้ให้ระบบ (VRAM เผื่อ ~15%, RAM/CPU กัน ~40%) = **งบ**
3. เลือกโมเดลใหญ่สุดที่ `needs ≤ งบ` = **ตัวแนะนำ**
4. เสนอ **เบากว่า** (ลื่นสุด) และ **จัดเต็ม** (ล้นเข้าแรม ช้าลงแต่ฉลาดกว่า) เป็นทางเลือก

> ตัวเลข `needs` เป็นค่าประมาณที่ quantization Q4 — ปรับสูตรได้ที่ `needsFromBytes()` ใน `scripts/fetch-models.mjs`

## License

MIT
