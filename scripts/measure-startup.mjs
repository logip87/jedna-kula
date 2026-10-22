// Repeatable cold-start comparison. Blocks service workers to measure foreground
// startup independently of PWA background precaching; offline is tested by E2E.
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve(process.argv[2] ?? "dist");
const runs = Number(process.argv[3] ?? 7);
const samples = [];
const types = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = resolve(root, "." + decodeURIComponent(url.pathname));
  if (!path.startsWith(root + "/") && path !== root) {
    res.writeHead(403).end();
    return;
  }
  try {
    const target = extname(path) ? path : resolve(root, "index.html");
    res.setHeader(
      "Content-Type",
      types[extname(target)] ?? "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-store");
    const body = await readFile(target);
    if (
      /gzip/.test(req.headers["accept-encoding"] ?? "") &&
      types[extname(target)]
    ) {
      res.setHeader("Content-Encoding", "gzip");
      res.end(gzipSync(body));
    } else res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch();
try {
  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 100,
      downloadThroughput: 200_000,
      uploadThroughput: 100_000,
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Dzisiaj", exact: true }).waitFor();
    samples.push(
      await page.evaluate(() => ({
        readyMs: Math.round(performance.now()),
        jsBytes: performance
          .getEntriesByType("resource")
          .filter((r) => r.name.endsWith(".js"))
          .reduce((sum, r) => sum + r.encodedBodySize, 0),
      })),
    );
    await context.close();
  }
  const median = (values) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  process.stdout.write(
    JSON.stringify(
      {
        runs,
        conditions:
          "Chromium; fresh context; 4x CPU; 100ms latency; 200kB/s; gzip; SW blocked",
        medianReadyMs: median(samples.map((s) => s.readyMs)),
        medianJsBytes: median(samples.map((s) => s.jsBytes)),
        samples,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
