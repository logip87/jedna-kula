// Count the entire eager JS import graph, rather than only the entry file.
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";
const root = resolve(process.argv[2] ?? "dist");
const manifest = JSON.parse(
  await readFile(resolve(root, ".vite/manifest.json"), "utf8"),
);
const entry = Object.keys(manifest).find((key) => manifest[key].isEntry);
if (!entry)
  throw new Error("No application entry found in the build manifest.");
const startup = new Set();
function visit(key) {
  if (startup.has(key)) return;
  const chunk = manifest[key];
  if (!chunk) throw new Error(`Missing imported chunk: ${key}`);
  startup.add(key);
  for (const dependency of chunk.imports ?? []) visit(dependency);
}
visit(entry);
const chunks = await Promise.all(
  Object.entries(manifest)
    .filter(([, chunk]) => chunk.file.endsWith(".js"))
    .map(async ([key, chunk]) => {
      const code = await readFile(resolve(root, chunk.file));
      return {
        key,
        file: chunk.file,
        bytes: code.length,
        gzipBytes: gzipSync(code).length,
      };
    }),
);
const eager = chunks.filter((chunk) => startup.has(chunk.key));
const sum = (items, field) =>
  items.reduce((total, item) => total + item[field], 0);
const report = {
  entry: chunks.find((chunk) => chunk.key === entry),
  startupBytes: sum(eager, "bytes"),
  startupGzipBytes: sum(eager, "gzipBytes"),
  totalJsBytes: sum(chunks, "bytes"),
  startupFiles: eager.map((chunk) => chunk.file),
  jsFiles: chunks.length,
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
if (
  report.startupBytes > 475_000 ||
  chunks.some((chunk) => chunk.bytes > 500_000)
) {
  throw new Error(
    "JS budget exceeded: startup graph ≤475 kB and each individual file ≤500 kB.",
  );
}
