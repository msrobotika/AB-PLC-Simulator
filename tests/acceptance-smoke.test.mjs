/**
 * Acceptance tests executed against REAL Node child processes on a clean checkout.
 * No browser mocks, no PLC hardware, no network except 127.0.0.1 loopback.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawn, execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;

async function startServer() {
  const child = spawn(node, ["scripts/serve.mjs"], {
    cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stdout = "", stderr = "";
  child.stderr.on("data", chunk => { stderr += chunk.toString(); });
  let timer;
  const url = await new Promise((ok, bad) => {
    timer = setTimeout(() => bad(new Error("Servidor sin respuesta: " + stderr)), 9000);
    child.on("error", bad);
    child.on("exit", code => bad(new Error("Servidor terminó " + code + ": " + stderr)));
    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
      const match = stdout.match(/AB-PLC Simulator: (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); ok(match[1]); }
    });
  }).finally(() => clearTimeout(timer));
  return {child, url, async close() {
    if (child.exitCode !== null) return;
    const done = new Promise(ok => child.once("exit", ok));
    child.kill();
    await done;
  }};
}

test("arranque limpio de Node sin instalación: interfaz y recursos públicos", async () => {
  const s = await startServer();
  try {
    for (const [path, expected] of [
      ["/", "AB-PLC"], ["/index.html", "AB-PLC"],
      ["/src/app.js", "import"], ["/src/plc-engine.js", "export"],
      ["/assets/favicon.svg", "<svg"],
      ["/examples/conveyor-with-fault.json", "conveyor"]
    ]) {
      const response = await fetch(s.url + path);
      assert.equal(response.status, 200, "Debe servir " + path);
      assert.match(await response.text(), new RegExp(expected, "i"));
    }
    const head = await fetch(s.url + "/index.html", { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    assert.equal(head.headers.get("x-content-type-options"), "nosniff");
  } finally { await s.close(); }
});

test("el servidor NO publica fuentes backend, configuraciones ni ficheros internos", async () => {
  const s = await startServer();
  try {
    for (const path of [
      "/package.json", "/LICENSE", "/README.md",
      "/scripts/serve.mjs", "/scripts/serve-suite-core.mjs",
      "/tests/plant-runtime.test.mjs", "/.github/workflows/verify.yml",
      "/.git/config", "/.env", "/.npmrc", "/node_modules/foo.js",
      "/src/../package.json", "/%2eenv", "/docs/PROJECT_STATUS.md"
    ]) {
      const response = await fetch(s.url + path);
      assert.equal(response.status, 404, "Fichero privado accesible: " + path);
    }
    const post = await fetch(s.url + "/index.html", {method:"POST"});
    assert.equal(post.status, 405);
    assert.equal(post.headers.get("access-control-allow-origin"), null);
  } finally { await s.close(); }
});

test("CLI real: fallo de cinta, recuperación, 150 scans y exportaciones", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ab-plc-acceptance-"));
  try {
    const csv = join(dir, "conveyor.csv"), json = join(dir, "conveyor.json");
    const {stdout} = await execFile(node, [
      "scripts/run-scenario.mjs", "--scenario", "examples/conveyor-with-fault.json",
      "--csv", csv, "--json", json
    ], {cwd:root,timeout:15000});
    const result = JSON.parse(stdout);
    const data = JSON.parse(await readFile(json,"utf8"));
    const lines = (await readFile(csv,"utf8")).trim().split(/\r\n/);
    assert.equal(result.ok,true); assert.equal(result.scans,150);
    assert.equal(result.timeMs,15000);
    assert.equal(lines.length,151, "Cabecera + 150 muestras reales");
    assert.equal(data.samples.length,150);
    assert.equal(data.source,"virtual");
    assert.equal(data.samples[100].faults.jam,true);
    assert.equal(data.samples[119].faults.jam,true);
    assert.equal(data.samples[120].faults.jam,false);
    assert.equal(data.samples[0].scan,1);
    assert.equal(data.samples.at(-1).scan,150);
    assert.equal(data.producer.version,"0.4.0");
  } finally { await rm(dir,{recursive:true,force:true}); }
});

test("CLI real: fuga del depósito, recuperación, 600 scans y CSV", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ab-plc-tank-"));
  try {
    const csv = join(dir,"tank.csv"),json=join(dir,"tank.json");
    const {stdout} = await execFile(node,[
      "scripts/run-scenario.mjs","--scenario","examples/tank-cycle.json",
      "--csv",csv,"--json",json
    ],{cwd:root,timeout:15000});
    const run=JSON.parse(stdout),data=JSON.parse(await readFile(json,"utf8"));
    assert.equal(run.ok,true);assert.equal(run.scans,600);
    assert.equal(data.samples.length,600);
    assert.equal((await readFile(csv,"utf8")).trim().split(/\r\n/).length,601);
    assert.equal(data.samples[150].faults.leak,true);
    assert.equal(data.samples[239].faults.leak,true);
    assert.equal(data.samples[240].faults.leak,false);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
