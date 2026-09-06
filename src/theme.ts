// สลับธีม สว่าง/มืด — จำค่าใน localStorage, ถ้าไม่เคยเลือกจะตามระบบ
const KEY = "laf-theme";
type Theme = "light" | "dark";

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function systemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function effective(): Theme {
  return stored() ?? (systemDark() ? "dark" : "light");
}

const SUN =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
const MOON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

function apply(): void {
  const s = stored();
  const root = document.documentElement;
  if (s) root.setAttribute("data-theme", s);
  else root.removeAttribute("data-theme");

  const btn = document.getElementById("themeBtn");
  if (btn) {
    const dark = effective() === "dark";
    btn.innerHTML = dark ? SUN : MOON; // แสดงไอคอนของธีมที่กดแล้วจะเปลี่ยนไป
    btn.setAttribute("aria-label", dark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด");
    btn.title = dark ? "ธีมสว่าง" : "ธีมมืด";
  }
}

export function initTheme(): void {
  const btn = document.getElementById("themeBtn");
  btn?.addEventListener("click", () => {
    const next: Theme = effective() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* localStorage ถูกปิด — ธีมจะไม่ถูกจำ แต่ยังสลับได้ในรอบนี้ */
    }
    apply();
  });
  // ตามระบบต่อ เมื่อผู้ใช้ยังไม่เคยเลือกเอง
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!stored()) apply();
  });
  apply();
}
