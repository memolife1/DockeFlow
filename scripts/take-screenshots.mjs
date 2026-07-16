// One-off utility to capture real app screenshots for the marketing
// landing page. Reads credentials from env vars (never hardcode them here)
// and only navigates/reads — it never creates a new presentation or
// triggers AI generation, so it's safe to run against a real account.
//
// Usage:
//   SCREENSHOT_EMAIL=you@example.com SCREENSHOT_PASSWORD=... \
//     node scripts/take-screenshots.mjs
import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const OUT = "public/assets";
fs.mkdirSync(OUT, { recursive: true });

const email = process.env.SCREENSHOT_EMAIL;
const password = process.env.SCREENSHOT_PASSWORD;
if (!email || !password) {
  console.error("Set SCREENSHOT_EMAIL and SCREENSHOT_PASSWORD env vars first.");
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM_PATH || undefined,
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
});
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Log in with the real account (this app's auth routes are /login and
// /signup, not /sign-in — the codebase doesn't use the latter).
await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
await page.waitForLoadState("networkidle");

await page.screenshot({ path: `${OUT}/screen-dashboard.png`, fullPage: false });
console.log("captured screen-dashboard.png");

// Wizard step 1 — topic input. Read-only: never submits the form, so it
// never triggers a real AI generation call.
await page.goto(`${BASE}/new`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${OUT}/screen-wizard-step1.png`, fullPage: false });
console.log("captured screen-wizard-step1.png");

// Templates gallery
await page.goto(`${BASE}/templates`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${OUT}/screen-templates.png`, fullPage: false });
console.log("captured screen-templates.png");

// Editor + export dialog — only if the account already has a presentation.
// Never creates one.
await page.goto(`${BASE}/dashboard`);
await page.waitForLoadState("networkidle");
const presLink = await page.$('a[href*="/presentations/"]');
if (presLink) {
  await presLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/screen-editor.png`, fullPage: false });
  console.log("captured screen-editor.png");

  const exportBtn = await page.$('button:has-text("Export")');
  if (exportBtn) {
    await exportBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/screen-export.png`, fullPage: false });
    console.log("captured screen-export.png");
  }
} else {
  console.log("no existing presentation found — skipped screen-editor.png / screen-export.png");
}

await browser.close();
console.log("Done.");
