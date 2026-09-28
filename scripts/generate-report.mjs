import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputDirectory = path.join(projectRoot, 'runner-results');
const detailDirectory = path.join(projectRoot, 'runner-details');
const screenshotDirectory = path.join(projectRoot, 'cypress', 'screenshots');
const outputDirectory = path.join(projectRoot, 'reports');
const outputFile = path.join(outputDirectory, 'parallel-report.html');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function normalizePath(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\//, '');
}

function normalizeTitle(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function findScreenshots(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findScreenshots(entryPath) : [entryPath];
  }));
  return nested.flat().filter((entryPath) => entryPath.toLowerCase().endsWith('.png'));
}

async function attachScreenshot(test, specFile) {
  const specDirectory = path.join(screenshotDirectory, path.basename(specFile));
  const screenshots = await findScreenshots(specDirectory);
  const titleToken = normalizeTitle(test.title);
  const screenshotPath = screenshots.find((candidate) => {
    const filename = path.basename(candidate);
    return filename.includes('(failed)') && normalizeTitle(filename).includes(titleToken);
  });

  if (!screenshotPath) return null;
  const image = await readFile(screenshotPath);
  return {
    filename: path.basename(screenshotPath),
    dataUrl: `data:image/png;base64,${image.toString('base64')}`,
  };
}

const filenames = (await readdir(inputDirectory)).filter((filename) => filename.endsWith('.json'));

if (filenames.length === 0) {
  throw new Error(`No cypress-parallel JSON summaries found in ${inputDirectory}`);
}

const results = await Promise.all(filenames.map(async (filename) => {
  const content = await readFile(path.join(inputDirectory, filename), 'utf8');
  const result = JSON.parse(content);
  const requiredFields = ['tests', 'passes', 'failures', 'pending', 'duration', 'file'];

  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new Error(`Missing "${field}" in ${filename}`);
    }
  }

  return result;
}));

let detailFilenames = [];
try {
  detailFilenames = (await readdir(detailDirectory)).filter((filename) => filename.endsWith('.json'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const details = await Promise.all(detailFilenames.map(async (filename) => {
  const content = await readFile(path.join(detailDirectory, filename), 'utf8');
  return JSON.parse(content);
}));

for (const result of results) {
  const detail = details.find((candidate) =>
    normalizePath(candidate.file) === normalizePath(result.file)
    && Date.parse(candidate.start) === Date.parse(result.start));
  result.testDetails = detail?.tests || [];

  for (const test of result.testDetails.filter((entry) => entry.state === 'failed')) {
    test.screenshot = await attachScreenshot(test, result.file);
  }
}

results.sort((left, right) => left.file.localeCompare(right.file));

const totals = results.reduce((summary, result) => ({
  tests: summary.tests + result.tests,
  passes: summary.passes + result.passes,
  failures: summary.failures + result.failures,
  pending: summary.pending + result.pending,
  duration: summary.duration + result.duration,
}), { tests: 0, passes: 0, failures: 0, pending: 0, duration: 0 });

const generatedAt = new Date().toLocaleString();
const runStatus = totals.failures === 0 ? 'Passed' : 'Failed';
const statusClass = totals.failures === 0 ? 'passed' : 'failed';
const rows = results.map((result) => {
  const status = result.failures > 0 ? 'Failed' : 'Passed';
  const durationSeconds = (result.duration / 1000).toFixed(1);
  const failureDetails = result.testDetails.filter((test) => test.state === 'failed');
  const failureContent = failureDetails.length > 0
    ? failureDetails.map((test) => `<article class="failure">
        <h3>${escapeHtml(test.fullTitle || test.title)}</h3>
        <p>${escapeHtml(test.error?.message || 'Test failed without an error message.')}</p>
        <details><summary>Stack trace</summary><pre>${escapeHtml(test.error?.stack || 'Stack trace unavailable.')}</pre></details>
        ${test.screenshot
          ? `<details><summary>Failure screenshot: ${escapeHtml(test.screenshot.filename)}</summary><img class="failure-image" src="${test.screenshot.dataUrl}" alt="Screenshot captured when ${escapeHtml(test.fullTitle || test.title)} failed"></details>`
          : '<p class="muted">No matching Cypress failure screenshot was found.</p>'}
      </article>`).join('\n')
    : '';
  const detailRow = result.failures > 0
    ? `<tr class="failure-row"><td colspan="7">${failureContent || '<p class="muted">Failure details were not captured for this run.</p>'}</td></tr>`
    : '';

  return `<tr>
    <td>${escapeHtml(result.file)}</td>
    <td>${result.tests}</td>
    <td class="passed-text">${result.passes}</td>
    <td class="${result.failures ? 'failed-text' : ''}">${result.failures}</td>
    <td>${result.pending}</td>
    <td>${durationSeconds}s</td>
    <td><span class="status ${result.failures ? 'failed' : 'passed'}">${status}</span></td>
  </tr>${detailRow}`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SauceDemo Cypress E2E Report</title>
  <style>
    :root { color-scheme: light; font-family: "Segoe UI", sans-serif; color: #1b2428; background: #f4f6f5; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 36px 20px; }
    main { max-width: 1080px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: end; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid #ccd5d2; }
    h1 { margin: 0; font-size: 28px; }
    .meta { margin: 8px 0 0; color: #5c6a6d; font-size: 14px; }
    .status { display: inline-block; border-radius: 4px; padding: 5px 9px; font-size: 12px; font-weight: 700; }
    .passed { background: #dff3e7; color: #17653a; }
    .failed { background: #fae2df; color: #9c2d24; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
    .metric { padding: 16px; background: #fff; border: 1px solid #dbe2df; border-radius: 6px; }
    .metric span { display: block; color: #5c6a6d; font-size: 13px; }
    .metric strong { display: block; margin-top: 8px; font-size: 24px; }
    .table-wrap { overflow-x: auto; background: #fff; border: 1px solid #dbe2df; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e5eae8; white-space: nowrap; }
    th { background: #edf2f0; color: #344448; font-size: 12px; text-transform: uppercase; }
    tbody tr:last-child td { border-bottom: 0; }
    .passed-text { color: #17653a; font-weight: 600; }
    .failed-text { color: #9c2d24; font-weight: 700; }
    .failure-row td { white-space: normal; background: #fff8f7; }
    .failure { padding: 12px 0; border-bottom: 1px solid #edc9c5; }
    .failure:last-child { border-bottom: 0; }
    .failure h3 { margin: 0 0 8px; font-size: 16px; }
    .failure pre { max-height: 360px; overflow: auto; padding: 12px; background: #f1f3f2; border-radius: 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
    .failure-image { display: block; width: min(100%, 1000px); height: auto; margin-top: 12px; border: 1px solid #ccd5d2; }
    .muted { color: #68777a; }
    footer { margin-top: 16px; color: #5c6a6d; font-size: 12px; }
    @media (max-width: 700px) { body { padding: 24px 12px; } header { align-items: start; flex-direction: column; } .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>SauceDemo Cypress E2E Report</h1>
        <p class="meta">Generated ${escapeHtml(generatedAt)} · ${results.length} parallel spec summaries</p>
      </div>
      <span class="status ${statusClass}">${runStatus}</span>
    </header>
    <section class="metrics" aria-label="Run totals">
      <div class="metric"><span>Total tests</span><strong>${totals.tests}</strong></div>
      <div class="metric"><span>Passed</span><strong class="passed-text">${totals.passes}</strong></div>
      <div class="metric"><span>Failed</span><strong class="${totals.failures ? 'failed-text' : ''}">${totals.failures}</strong></div>
      <div class="metric"><span>Pending</span><strong>${totals.pending}</strong></div>
      <div class="metric"><span>Summed spec duration</span><strong>${(totals.duration / 1000).toFixed(1)}s</strong></div>
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Spec</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Pending</th><th>Duration</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <footer>Durations are summed from each spec and do not represent parallel wall-clock time.</footer>
  </main>
</body>
</html>`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, html, 'utf8');
console.log(`HTML report written to ${path.relative(projectRoot, outputFile)}`);