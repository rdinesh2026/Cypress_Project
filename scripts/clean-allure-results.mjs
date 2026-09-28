import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDirectory = path.join(projectRoot, 'allure-results');

await rm(resultsDirectory, { recursive: true, force: true });
await mkdir(resultsDirectory, { recursive: true });