import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(projectRoot, 'allure-results');
const outputDirectory = path.join(projectRoot, '.allure-results-merged');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));

  return nestedFiles.flat();
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const files = await listFiles(sourceDirectory);
if (files.length === 0) {
  throw new Error(`No Allure result files found in ${sourceDirectory}`);
}

await Promise.all(files.map((file) => copyFile(file, path.join(outputDirectory, path.basename(file)))));
console.log(`Merged ${files.length} Allure result files for report generation.`);