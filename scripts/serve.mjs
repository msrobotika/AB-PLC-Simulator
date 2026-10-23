/**
 * AB-PLC Simulator browser-only development server.
 * Public asset allowlist: never serves .env, .git, npm credentials, tests, or
 * backend source/config. Localhost only; no real industrial I/O.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg"
};
const publicDirectories = new Map([
  ["src", new Set([".js", ".css"])],
  ["assets", new Set([".svg", ".png", ".webp", ".jpg"])],
  ["examples", new Set([".json"])],
  ["docs/screenshots", new Set([".png", ".webp", ".jpg"])]
]);

export function publicAsset(pathname) {
  // URL() canonicalises dot segments. Reject any nested private path even if
  // someone percent-encodes it, and NEVER fall back to arbitrary root files.
  if (pathname === "/" || pathname === "/index.html") return "index.html";
  if (!pathname.startsWith("/")) return null;
  const parts = pathname.slice(1).split("/");
  if (parts.some(part => !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(part) ||
    part.includes(".."))) return null;
  const directory = parts.length === 2 ? parts[0] :
    parts.length === 3 ? parts.slice(0, 2).join("/") : "";
  if (!publicDirectories.get(directory)?.has(extname(parts.at(-1)).toLowerCase()))
    return null;
  return parts.join("/");
}

if (host !== "127.0.0.1")
  throw new Error("AB-PLC Simulator solo admite HOST=127.0.0.1 (laboratorio local)");
if (!Number.isInteger(port) || port < 0 || port > 65535)
  throw new Error("Puerto de desarrollo fuera de rango");

const server = createServer(async (req, res) => {
  const respond = (status, message) => {
    res.writeHead(status, {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    });
    res.end(req.method === "HEAD" ? undefined : message);
  };
  try {
    if (req.method !== "GET" && req.method !== "HEAD")
      return respond(405, "Method Not Allowed");
    const requestURL = new URL(req.url, "http://127.0.0.1");
    const relative = publicAsset(decodeURIComponent(requestURL.pathname));
    if (!relative) return respond(404, "Not Found");
    const target = resolve(root, relative);
    const info = await stat(target);
    if (!info.isFile()) return respond(404, "Not Found");
    const body = await readFile(target);
    res.writeHead(200, {
      "Content-Type": types[extname(target).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY"
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (err) {
    return respond(err?.code === "ENOENT" ? 404 : 400, "Not Found");
  }
});
server.listen(port, host, () => {
  process.stdout.write("AB-PLC Simulator: http://" + host + ":" + server.address().port + "\n");
});
