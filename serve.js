/* Server static minimal pentru dezvoltare locală: node serve.js [port] */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 8400;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`CronoRO: http://localhost:${PORT}`));
