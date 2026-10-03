// Minimal static file server for the Fachnote content hub (Deno Deploy).
// Serves every file in this directory; extensionless paths resolve to .html.

const ROOT = new URL("./", import.meta.url).pathname;

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let path = decodeURIComponent(url.pathname);
  if (path.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  if (path.endsWith("/")) path += "index.html";

  const candidates = [path];
  const last = path.split("/").pop() ?? "";
  if (!last.includes(".")) candidates.push(path + ".html");

  for (const p of candidates) {
    try {
      const data = await Deno.readFile(ROOT + p.slice(1));
      const dot = p.lastIndexOf(".");
      const type = dot >= 0
        ? (CONTENT_TYPES[p.slice(dot).toLowerCase()] ?? "application/octet-stream")
        : "application/octet-stream";
      return new Response(data, {
        headers: { "content-type": type },
      });
    } catch {
      // try next candidate
    }
  }
  return new Response("Not found", { status: 404 });
});
