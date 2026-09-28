import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer';
import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    retries: 0,
    defaultCommandTimeout: 8000,
    env: {
      allure: true,
      allureResultsPath: 'allure-results',
    },
    setupNodeEvents(on, config) {
      const workerId = process.env.CYPRESS_THREAD;
      const resultsPath = workerId ? `allure-results/worker-${workerId}` : 'allure-results';
      config.env.allureResultsPath = resultsPath;
      config.expose.allureResultsPath = resultsPath;
      allureWriter(on, config);
      cypressGrepPlugin(config);
      return config;
    },
  },
  expose: {
    demoPassword: process.env.CYPRESS_DEMO_PASSWORD || 'secret_sauce',
    allure: true,
    allureResultsPath: 'allure-results',
  },
});