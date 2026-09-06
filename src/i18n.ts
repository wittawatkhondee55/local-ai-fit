export type Lang = "th" | "en";
export interface DetMsg {
  k: string;
  v?: Record<string, string | number>;
}

const KEY = "laf-lang";

const TH: Record<string, string> = {
  eyebrow: "Local AI · ตรวจในเครื่องคุณล้วนๆ ไม่ส่งข้อมูลออก",
  h1_html: 'รัน AI ตัวไหน<span class="hl">ไหว</span>',
  lede_html:
    "สแกนสเปกเครื่องผ่านบราวเซอร์ แล้วเลือกโมเดลที่รัน<b>สบาย</b> — เหลือแรมให้เครื่องทำงานอื่นได้ ไม่ใช่จัดเต็มจนหน่วง พร้อมคำสั่งติดตั้งกดคัดลอกใช้ได้เลย",
  scan: "สแกนเครื่องนี้",
  privacy: "ทำงานในเครื่องคุณ 100% ไม่มีการอัปโหลด",
  sec_specs: "สเปกที่ตรวจได้",
  badge_example: "ค่าตัวอย่าง",
  badge_live: "สแกนจริง",
  lbl_ram: "RAM (แรม)",
  lbl_gpu: "ชนิดการ์ดจอ",
  gpu_discrete: "การ์ดจอแยก NVIDIA / AMD",
  gpu_apple: "Apple Silicon (M1/M2/M3/M4)",
  gpu_integrated: "การ์ดจอออนบอร์ด / ไม่มีการ์ดแยก",
  lbl_vram: "VRAM การ์ดจอ (GB)",
  lbl_os: "ระบบปฏิบัติการ",
  hint_specs_html:
    "บราวเซอร์อ่านค่าได้แค่คร่าวๆ (โดยเฉพาะ RAM ที่มักโชว์สูงสุด 8GB และ VRAM ที่เดาจากชื่อรุ่น) — <b>ปรับตัวเลขให้ตรงเครื่องคุณ</b> หรือใช้ “ตรวจแบบแม่นยำ” ด้านล่าง",
  precise_summary: "🎯 อยากได้ค่าเป๊ะ? กดดูวิธีตรวจแบบแม่นยำ",
  precise_intro_html:
    "บราวเซอร์อ่าน RAM/VRAM ตรงๆ ไม่ได้ (ถูกจำกัดเพื่อความเป็นส่วนตัว) — วางคำสั่ง<b>อ่านค่าอย่างเดียว</b>นี้ใน PowerShell (Windows) หรือ Terminal (Mac/Linux) แล้วมันจะเปิดหน้านี้พร้อมกรอกค่าจริงให้อัตโนมัติ",
  precise_note: "🔒 ปลอดภัย: คำสั่งนี้แค่อ่านสเปกแล้วเปิดลิงก์ ไม่แก้ไข/ติดตั้งอะไรในเครื่อง",
  det_precise: "ตรวจแม่นยำจากเครื่อง ✓",
  sec_reco: "โมเดลที่แนะนำ",
  task_general: "ใช้งานทั่วไป",
  task_coding: "เขียนโค้ด",
  task_reasoning: "คิดวิเคราะห์",
  pick_this: "จะติดตั้งตัวนี้",
  legend_use: "โมเดลใช้",
  legend_free: "เหลือว่างให้งานอื่น",
  pick_hint: "👆 กดการ์ดด้านล่าง (หรือการ์ดนี้) เพื่อเลือกตัวที่จะติดตั้ง",
  sel_suffix: "· เลือกแล้ว",
  role_light: "เบากว่า · ลื่นสุด",
  role_heavy: "จัดเต็ม · ถ้ายอมช้าลง",
  chip_size: "ขนาด",
  chip_mem: "แรมที่ใช้",
  chip_disk: "พื้นที่ดิสก์",
  chip_speed: "ความเร็ว",
  chip_cmd: "คำสั่ง",
  req_title: "ต้องมีพื้นที่ว่างในเครื่อง",
  req_disk: "พื้นที่ดิสก์",
  req_ram: "แรม (ขณะรัน)",
  gauge_pool: "หน่วยความจำที่ใช้ ({pool})",
  pool_vram: "VRAM",
  pool_unified: "หน่วยความจำรวม",
  pool_ram: "RAM",
  gauge_nums: "ใช้ ~{used} / {total}GB · เหลือ ~{free}GB",
  alt_desc_light: "ลื่นที่สุด เหลือเครื่องว่างเยอะ",
  alt_desc_heavy: "ล้นเข้าแรม จะช้าลงแต่ฉลาดกว่า",
  alt_empty_light: "— ไม่มีรุ่นเบากว่านี้",
  alt_empty_heavy: "เครื่องนี้จัดเต็มกว่านี้ไม่ไหวแล้ว 👍",
  v_limited: "เครื่องค่อนข้างจำกัด — เริ่มจากรุ่นเล็ก",
  v_gpu: "รันได้สบาย · เร่งด้วยการ์ดจอ",
  v_apple: "รันได้ดี · เร่งด้วย Metal",
  v_spill: "รันได้ แต่โมเดลล้นเข้าแรม จะช้าลง",
  v_cpu: "รันบน CPU ได้ · จะช้ากว่ามีการ์ดจอ",
  sp_fast: "เร็ว ⚡",
  sp_applemid: "เร็ว–ปานกลาง",
  sp_mid: "ปานกลาง",
  sp_midslow: "ปานกลาง–ช้า",
  sp_ok: "พอไหว",
  sec_install: "ติดตั้งแล้วรันเลย",
  copyall: "📋 คัดลอกทั้งชุด",
  copyall_done: "คัดลอกทั้งชุดแล้ว ✓",
  step1_t: "ติดตั้ง Ollama (โปรแกรมรันโมเดล ฟรี)",
  copy: "คัดลอก",
  copied: "คัดลอกแล้ว ✓",
  install_alt_win_html:
    'ไม่มี winget? โหลดตัวติดตั้ง <a href="https://ollama.com/download/windows" target="_blank" rel="noopener">ollama.com/download/windows</a>',
  install_alt_mac_html:
    'หรือโหลดแอป <a href="https://ollama.com/download/mac" target="_blank" rel="noopener">ollama.com/download/mac</a>',
  install_alt_linux_html: "รองรับ Ubuntu/Debian/Fedora ฯลฯ",
  step2_title: "ดาวน์โหลด + รันโมเดล: <b>{name}</b> (ครั้งแรกโหลด ~{size}GB)",
  step2_hint: "พิมพ์คำสั่งนี้ใน Terminal / PowerShell แล้วรอโหลดเสร็จ ก็พิมพ์คุยได้เลย",
  step3_t: "อยากได้หน้าจอแชตสวยๆ (ไม่บังคับ)",
  step3_b_html:
    'ใช้ <a href="https://lmstudio.ai" target="_blank" rel="noopener">LM Studio</a> (มี UI ในตัว) หรือ <a href="https://github.com/open-webui/open-webui" target="_blank" rel="noopener">Open WebUI</a> (หน้าตาคล้าย ChatGPT ต่อกับ Ollama) — ถ้าจะทำเป็น<b>เว็บให้คนอื่นใช้</b> ต่อ Open WebUI แล้วเปิดพอร์ตออกไปได้เลย',
  sec_howto: "คู่มือแบบละเอียด (สำหรับมือใหม่)",
  howto_intro: "ไม่เคยลงมาก่อนก็ทำตามได้ ทีละขั้น — ใช้เวลาไม่เกิน 10 นาที",
  sec_ranking: "จัดอันดับโมเดล",
  ranking_note: "* คะแนนเป็นค่าประเมินโดยประมาณ (อ้างอิงคุณภาพ/เบนช์มาร์คโดยรวม) ใช้เทียบคร่าวๆ ไม่ใช่ตัวเลขทางการ — จัดอันดับเฉพาะโมเดลที่คิวเรตไว้",
  sec_catalog: "คลังโมเดล",
  th_model: "โมเดล",
  th_size: "ขนาด",
  th_mem: "ใช้หน่วยความจำ*",
  th_skill: "ถนัด",
  cat_general: "ทั่วไป",
  cat_coding: "โค้ด",
  cat_reasoning: "เหตุผล",
  note_html:
    "<b>* ตัวเลขคือค่าประมาณตอนใช้ quantization Q4</b> (บีบโมเดลให้เล็กลงโดยคุณภาพเสียน้อย) — ค่าจริงขยับตามความยาวบทสนทนา · รายชื่อ + ขนาดดึงมาจาก Ollama registry อัตโนมัติ ",
  gen_at: "· อัปเดตล่าสุด {date}",
  footer_a: "ตรวจในเครื่อง · ไม่เก็บ ไม่ส่งข้อมูล",
  footer_b: "ขับเคลื่อนด้วย Ollama · โมเดล open-source",
  det_ram_ge8: "บราวเซอร์บอก ≥8GB — โปรดยืนยัน",
  det_ram_approx: "บราวเซอร์บอก ~{n}GB",
  det_ram_unknown: "บราวเซอร์อ่านไม่ได้ — กรอกเอง",
  det_vram_guess: 'เดาจาก "{gpu}"',
  det_vram_unknown: "ไม่รู้จักรุ่นนี้ — กรอกเอง",
  det_vram_apple: "ใช้หน่วยความจำรวมกับ RAM",
  det_vram_integrated: "ใช้ RAM ร่วม (ไม่มี VRAM แยก)",
  det_set_manual: "ตั้งค่าเอง",
  gpu_unread: "อ่านชื่อการ์ดจอไม่ได้",
  lang_name: "TH",
};

const EN: Record<string, string> = {
  eyebrow: "Local AI · runs entirely on your machine, nothing uploaded",
  h1_html: 'What AI can <span class="hl">you run</span>',
  lede_html:
    "Scan your PC in the browser, then pick a model that runs <b>comfortably</b> — leaving memory free for other apps instead of maxing everything out, with copy-ready install commands.",
  scan: "Scan this PC",
  privacy: "Runs 100% on your device, no uploads",
  sec_specs: "Detected specs",
  badge_example: "Example",
  badge_live: "Scanned",
  lbl_ram: "RAM",
  lbl_gpu: "GPU type",
  gpu_discrete: "Discrete NVIDIA / AMD",
  gpu_apple: "Apple Silicon (M1/M2/M3/M4)",
  gpu_integrated: "Integrated / no discrete GPU",
  lbl_vram: "GPU VRAM (GB)",
  lbl_os: "Operating system",
  hint_specs_html:
    "The browser can only read specs roughly (RAM often caps at 8GB, VRAM is guessed from the model name) — <b>adjust the numbers to match your PC</b>, or use the “Precise scan” below.",
  precise_summary: "🎯 Want exact numbers? Show the precise scan",
  precise_intro_html:
    "Browsers can't read RAM/VRAM directly (privacy limits) — paste this <b>read-only</b> command into PowerShell (Windows) or Terminal (Mac/Linux); it opens this page with your real specs filled in automatically.",
  precise_note: "🔒 Safe: it only reads specs and opens a link — it installs and changes nothing.",
  det_precise: "Precise scan from your PC ✓",
  sec_reco: "Recommended model",
  task_general: "General",
  task_coding: "Coding",
  task_reasoning: "Reasoning",
  pick_this: "Will install this",
  legend_use: "Model uses",
  legend_free: "Free for other apps",
  pick_hint: "👆 Tap a card below (or this one) to choose what to install",
  sel_suffix: "· selected",
  role_light: "Lighter · smoothest",
  role_heavy: "Max · if you accept slower",
  chip_size: "Size",
  chip_mem: "RAM used",
  chip_disk: "Disk space",
  chip_speed: "Speed",
  chip_cmd: "Command",
  req_title: "Free space you'll need",
  req_disk: "Disk space",
  req_ram: "RAM (while running)",
  gauge_pool: "Memory used ({pool})",
  pool_vram: "VRAM",
  pool_unified: "Unified memory",
  pool_ram: "RAM",
  gauge_nums: "Uses ~{used} / {total}GB · ~{free}GB free",
  alt_desc_light: "Smoothest, lots of headroom",
  alt_desc_heavy: "Spills to RAM — slower but smarter",
  alt_empty_light: "— no lighter option",
  alt_empty_heavy: "This PC can't push higher 👍",
  v_limited: "Limited PC — start with a small model",
  v_gpu: "Runs comfortably · GPU-accelerated",
  v_apple: "Runs well · Metal-accelerated",
  v_spill: "Runs, but spills to RAM — slower",
  v_cpu: "Runs on CPU · slower than with a GPU",
  sp_fast: "Fast ⚡",
  sp_applemid: "Fast–medium",
  sp_mid: "Medium",
  sp_midslow: "Medium–slow",
  sp_ok: "OK",
  sec_install: "Install & run",
  copyall: "📋 Copy all",
  copyall_done: "Copied all ✓",
  step1_t: "Install Ollama (free model runner)",
  copy: "Copy",
  copied: "Copied ✓",
  install_alt_win_html:
    'No winget? Download the installer at <a href="https://ollama.com/download/windows" target="_blank" rel="noopener">ollama.com/download/windows</a>',
  install_alt_mac_html:
    'Or download the app at <a href="https://ollama.com/download/mac" target="_blank" rel="noopener">ollama.com/download/mac</a>',
  install_alt_linux_html: "Works on Ubuntu/Debian/Fedora, etc.",
  step2_title: "Download + run the model: <b>{name}</b> (first run downloads ~{size}GB)",
  step2_hint: "Paste this into Terminal / PowerShell, wait for the download, then just type to chat.",
  step3_t: "Want a nicer chat UI? (optional)",
  step3_b_html:
    'Use <a href="https://lmstudio.ai" target="_blank" rel="noopener">LM Studio</a> (built-in UI) or <a href="https://github.com/open-webui/open-webui" target="_blank" rel="noopener">Open WebUI</a> (ChatGPT-like, connects to Ollama) — to make a <b>site others can use</b>, put Open WebUI in front and expose it.',
  sec_howto: "Step-by-step guide (for beginners)",
  howto_intro: "Never installed one before? Follow along step by step — under 10 minutes.",
  sec_ranking: "Model ranking",
  ranking_note: "* Scores are rough estimates (overall quality / benchmarks) for quick comparison — not official numbers. Only curated models are ranked.",
  sec_catalog: "Model catalog",
  th_model: "Model",
  th_size: "Size",
  th_mem: "Memory*",
  th_skill: "Best at",
  cat_general: "General",
  cat_coding: "Code",
  cat_reasoning: "Reasoning",
  note_html:
    "<b>* Numbers are estimates at Q4 quantization</b> (shrinks the model with little quality loss) — real usage varies with conversation length · names + sizes pulled automatically from the Ollama registry ",
  gen_at: "· updated {date}",
  footer_a: "Runs locally · nothing stored or sent",
  footer_b: "Powered by Ollama · open-source models",
  det_ram_ge8: "Browser reports ≥8GB — please confirm",
  det_ram_approx: "Browser reports ~{n}GB",
  det_ram_unknown: "Browser can't read it — enter manually",
  det_vram_guess: 'guessed from "{gpu}"',
  det_vram_unknown: "unknown model — enter manually",
  det_vram_apple: "shares memory with RAM",
  det_vram_integrated: "uses shared RAM (no dedicated VRAM)",
  det_set_manual: "set manually",
  gpu_unread: "couldn't read GPU name",
  lang_name: "EN",
};

const DICT: Record<Lang, Record<string, string>> = { th: TH, en: EN };

/** คู่มือมือใหม่ — เนื้อหายาว เก็บแยกจาก dict ปกติ */
export const HOWTO: Record<Lang, { t: string; b: string }[]> = {
  th: [
    {
      t: "1 · Local AI คืออะไร แล้วฟรีจริงไหม?",
      b: "คือ AI (แบบ ChatGPT) ที่รันในเครื่องคุณเอง <b>ฟรีไม่จำกัด</b> ไม่มีค่ารายเดือน ไม่ต่อเน็ตก็ใช้ได้ ข้อมูลไม่ออกจากเครื่อง — จ่ายแค่ค่าไฟตอนใช้งาน",
    },
    {
      t: "2 · ติดตั้งโปรแกรม Ollama",
      b: 'ไปที่ <a href="https://ollama.com/download" target="_blank" rel="noopener">ollama.com/download</a> เลือกระบบของคุณ (Windows/Mac/Linux) กดโหลดแล้วติดตั้งเหมือนโปรแกรมทั่วไป (กด Next ไปเรื่อยๆ) — หรือใช้คำสั่งในหัวข้อ “ติดตั้งแล้วรันเลย” ด้านบน',
    },
    {
      t: "3 · เปิดหน้าต่างพิมพ์คำสั่ง (Terminal)",
      b: '<b>Windows:</b> กดปุ่ม Start พิมพ์ว่า <code>powershell</code> แล้วกด Enter · <b>Mac:</b> กด <code>Cmd + Space</code> พิมพ์ <code>Terminal</code> แล้วกด Enter — จะได้หน้าต่างสีดำ/ขาวไว้พิมพ์คำสั่ง',
    },
    {
      t: "4 · วางคำสั่งรันโมเดล",
      b: 'เลื่อนขึ้นไปที่หัวข้อ <b>“ดาวน์โหลด + รันโมเดล”</b> กดปุ่ม <b>คัดลอก</b> แล้วมาคลิกขวา (หรือ <code>Ctrl+V</code>) วางในหน้าต่างที่เปิด กด Enter — ครั้งแรกจะโหลดโมเดล (รอสักครู่ตามขนาด)',
    },
    {
      t: "5 · เริ่มคุยได้เลย",
      b: 'พอโหลดเสร็จจะขึ้น <code>>>></code> พิมพ์อะไรก็ได้แล้วกด Enter เพื่อคุย · อยากออกพิมพ์ <code>/bye</code> · อยากคุยอีกครั้งพิมพ์คำสั่ง <code>ollama run ...</code> เดิมได้เลย (ครั้งต่อไปไม่ต้องโหลดใหม่)',
    },
    {
      t: "6 · มีหลายโมเดลในเครื่องเดียว แล้วสลับใช้",
      b: 'Ollama เก็บได้หลายโมเดลพร้อมกัน โหลดเก็บไว้ได้เลย เช่น<br><code>ollama pull qwen2.5:7b</code> (คุยทั่วไป)<br><code>ollama pull qwen2.5-coder:7b</code> (เขียนโค้ด)<br>ดูที่มีทั้งหมดด้วย <code>ollama list</code> · จะใช้ตัวไหนก็ <code>ollama run ชื่อโมเดล</code> ตัวนั้น — เลือกให้เหมาะกับงานได้',
    },
    {
      t: "7 · อยากได้หน้าจอสวย + แชร์ให้เพื่อน",
      b: 'ลง <a href="https://lmstudio.ai" target="_blank" rel="noopener">LM Studio</a> (มีหน้าจอในตัว) หรือ <a href="https://github.com/open-webui/open-webui" target="_blank" rel="noopener">Open WebUI</a> (คล้าย ChatGPT + มีเมนูสลับโมเดล) · จะให้เพื่อนใช้ผ่านเน็ตแบบปลอดภัย ใช้ <a href="https://tailscale.com/download" target="_blank" rel="noopener">Tailscale</a> คู่กับ Open WebUI ได้',
    },
  ],
  en: [
    {
      t: "1 · What is Local AI, and is it really free?",
      b: "It's an AI (like ChatGPT) running on your own machine — <b>free and unlimited</b>, no monthly fee, works offline, and your data never leaves your PC. You only pay for the electricity while it runs.",
    },
    {
      t: "2 · Install the Ollama app",
      b: 'Go to <a href="https://ollama.com/download" target="_blank" rel="noopener">ollama.com/download</a>, pick your system (Windows/Mac/Linux), download and install it like any app (just keep clicking Next) — or use the command in the “Install & run” section above.',
    },
    {
      t: "3 · Open a command window (Terminal)",
      b: '<b>Windows:</b> press Start, type <code>powershell</code>, hit Enter · <b>Mac:</b> press <code>Cmd + Space</code>, type <code>Terminal</code>, hit Enter — you get a window for typing commands.',
    },
    {
      t: "4 · Paste the run command",
      b: 'Scroll up to <b>“Download + run the model”</b>, click <b>Copy</b>, then paste it into the window (right-click or <code>Ctrl+V</code>) and press Enter — the first time it downloads the model (wait a bit depending on size).',
    },
    {
      t: "5 · Start chatting",
      b: 'When it\'s ready you\'ll see <code>>>></code>. Type anything and press Enter to chat · type <code>/bye</code> to exit · run the same <code>ollama run ...</code> again anytime (no re-download next time).',
    },
    {
      t: "6 · Keep many models, switch between them",
      b: 'One Ollama holds many models at once. Pull as many as you like:<br><code>ollama pull qwen2.5:7b</code> (general chat)<br><code>ollama pull qwen2.5-coder:7b</code> (coding)<br>See them all with <code>ollama list</code> · run any with <code>ollama run modelname</code> — pick the right one per task.',
    },
    {
      t: "7 · Nicer UI + sharing with friends",
      b: 'Install <a href="https://lmstudio.ai" target="_blank" rel="noopener">LM Studio</a> (built-in UI) or <a href="https://github.com/open-webui/open-webui" target="_blank" rel="noopener">Open WebUI</a> (ChatGPT-like with a model switcher) · to let friends use it over the internet safely, pair <a href="https://tailscale.com/download" target="_blank" rel="noopener">Tailscale</a> with Open WebUI.',
    },
  ],
};

let lang: Lang = load();

function load(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "th" || v === "en") return v;
  } catch {
    /* localStorage ปิด */
  }
  return (navigator.language || "").toLowerCase().startsWith("en") ? "en" : "th";
}

export function getLang(): Lang {
  return lang;
}
export function setLang(l: Lang): void {
  lang = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* ไม่จำก็ไม่เป็นไร */
  }
}
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = DICT[lang][key] ?? DICT.th[key] ?? key;
  if (vars) for (const k in vars) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
  return s;
}
export function td(msg?: DetMsg): string {
  return msg ? t(msg.k, msg.v) : "";
}

/** เติมข้อความให้ element ที่มี data-i18n / data-i18n-html */
export function applyStatic(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n as string);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml as string);
  });
  document.documentElement.lang = lang;
}
