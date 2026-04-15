import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCsv } from "@/lib/data/csv";
import { buildDatasetFromRawFiles } from "@/lib/data/loaders";

async function loadFile(relativePath: string) {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const dataset = await buildDatasetFromRawFiles({
    loadFile,
    parseCsv
  });

  const outputPath = path.join(
    process.cwd(),
    "data/normalized/calculator-dataset.json"
  );

  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
