# SauceDemo Cypress E2E

Cypress end-to-end tests for [SauceDemo](https://www.saucedemo.com/) using TypeScript and Page Object Model. The test scope and scenario IDs are documented in [TEST_PLAN.md](TEST_PLAN.md).

## Requirements

- Node.js LTS and npm
- Network access to SauceDemo
- Google Chrome for the CI browser run; local `cypress run` uses Cypress's bundled browser by default

## Install and Run

```sh
npm ci
npm run cy:open
npm run cy:run
npm run cy:run:smoke
npm run cy:run:parallel
npm run cy:run:parallel:headed
npm run cy:run:smoke
npm run cy:run:parallel:smoke:headed
npm run cy:run:regression
npm run cy:run:parallel:regression:headed
npm run report:allure
npm run open:allure
npm run report:html
```

`cy:run:parallel` distributes specs across four processes using `cypress-parallel`. `cy:run:parallel:headed` runs those workers in headed Chrome. To override the public demo password for a compatible environment, set `CYPRESS_DEMO_PASSWORD`; the default is SauceDemo's published demo password. Do not use real credentials in these tests.

After a parallel run, `npm run report:html` combines its per-spec summaries into `reports/parallel-report.html`. The HTML report includes test counts, pass/fail/pending totals, spec durations, and an overall run summary.

Allure results are written to `allure-results` during Cypress runs. Generate the interactive Allure HTML report with `npm run report:allure`, then open it with `npm run open:allure`. Allure attaches Cypress failure screenshots automatically and includes the error stack in the failed test details. Java must be installed for the Allure command-line report generator.

## Project Layout

- `cypress/e2e/`: workflow-focused Cypress specs
- `cypress/pages/`: page objects and user actions
- `cypress/fixtures/products.json`: catalog test data
- `cypress/support/`: custom commands and shared assertions
- `cypress.config.ts`: base URL, test discovery, retries, screenshots, and videos
- `reports/parallel-report.html`: generated parallel run summary
- `allure-report/`: generated interactive Allure report
- `.github/workflows/e2e.yml`: pull-request and push CI workflow

Each spec establishes its own session and cart state. The special-user smoke tests are separate from the standard-user purchase gate because those demo accounts intentionally behave differently.

Each `it()` block carries Cypress test metadata through its `tags` option. All cases are tagged `@regression`; the critical login, catalog, cart, and checkout paths also carry `@smoke`. Run only smoke-tagged tests with `npm run cy:run:smoke`, or use `npm run cy:run:parallel:smoke:headed` for four parallel headed Chrome workers. Run regression-tagged tests with `npm run cy:run:regression`, or use `npm run cy:run:parallel:regression:headed` for four parallel headed Chrome workers.