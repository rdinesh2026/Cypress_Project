const fs = require('node:fs');
const path = require('node:path');

function normalizeSpecPath(file) {
  const resolvedPath = path.isAbsolute(file) ? path.relative(process.cwd(), file) : file;
  return resolvedPath.replaceAll('\\', '/').replace(/^\.\//, '');
}

function safeFilename(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '_');
}

class FailureDetailsReporter {
  constructor(runner) {
    const testResults = [];

    runner.on('test end', (test) => {
      testResults.push({
        file: normalizeSpecPath(test.file || runner.suite.file || 'unknown-spec'),
        title: test.title,
        fullTitle: test.fullTitle(),
        state: test.state || (test.pending ? 'pending' : 'unknown'),
        duration: test.duration || 0,
        error: test.err
          ? {
            message: test.err.message || String(test.err),
            stack: test.err.stack || String(test.err),
          }
          : null,
      });
    });

    runner.once('end', () => {
      const groupedTests = new Map();
      for (const test of testResults) {
        const tests = groupedTests.get(test.file) || [];
        tests.push(test);
        groupedTests.set(test.file, tests);
      }

      const outputDirectory = path.join(process.cwd(), 'runner-details');
      fs.mkdirSync(outputDirectory, { recursive: true });

      for (const [file, tests] of groupedTests) {
        const filename = `${safeFilename(file)}.json`;
        const outputFile = path.join(outputDirectory, filename);
        fs.writeFileSync(outputFile, JSON.stringify({
          file,
          start: runner.stats.start,
          tests,
        }, null, 2));
      }
    });
  }
}

module.exports = FailureDetailsReporter;