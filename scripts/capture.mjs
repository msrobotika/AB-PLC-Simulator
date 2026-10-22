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
  await page.locator('.nav-item[data-view="kop"]').click();
  await page.locator("#kop-canvas .kop-rung").first().waitFor();
  if (await page.locator("#kop-canvas .kop-rung").count() !== 6) throw new Error("No se renderizan las seis redes");
  await page.screenshot({ path: "docs/screenshots/kop-editor.png", fullPage: true, animations: "disabled" });
  // Browser E2E: edit a new visual network, undo/redo, and load the compiled program.
  await page.locator("#kop-add").click();
  if (await page.locator("#kop-canvas .kop-rung").count() !== 7) throw new Error("No se crea la red");
  await page.locator("#kop-undo").click();
  if (await page.locator("#kop-canvas .kop-rung").count() !== 6) throw new Error("Undo falló");
  await page.locator("#kop-redo").click();
  await page.locator('#kop-canvas [data-op="add-parallel"]').last().click();
  await page.locator("#kop-apply").click();
  if (await page.locator("#kop-canvas .kop-rung").count() !== 7) throw new Error("La carga KOP falló");
  if (pageErrors.length) throw new Error("Errores de navegador: " + pageErrors.join("; "));
  process.stdout.write("Capturas reales y edición KOP E2E completadas\n");
} finally {
  await browser.close();
}
