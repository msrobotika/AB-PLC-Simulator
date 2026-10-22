/** Browser-generated screenshots used by CI; never synthetic renders. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.CAPTURE_URL ?? "http://127.0.0.1:4173";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 1536, height: 1050 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("ab-plc-program-v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#start-motor").click();
  await page.waitForTimeout(2800);
  if (pageErrors.length) throw new Error("Errores JavaScript: " + pageErrors.join("; "));
  const state = (await page.locator("#stat-state").innerText()).trim();
  if (state !== "RUNNING") throw new Error("La consola no está ejecutándose");
  const motor = await page.locator("#output-list").innerText();
  if (!motor.includes("ON")) throw new Error("La marcha no energizó una salida");
  await page.screenshot({ path: "docs/screenshots/dashboard.png", fullPage: true, animations: "disabled" });
  await page.locator('.nav-item[data-view="program"]').click();
  await page.screenshot({ path: "docs/screenshots/program.png", fullPage: true, animations: "disabled" });
  process.stdout.write("Capturas auténticas creadas en docs/screenshots/\n");
} finally {
  await browser.close();
}
