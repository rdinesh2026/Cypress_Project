import './commands';
import { register as registerCypressGrep } from '@cypress/grep';

Object.defineProperty(Cypress, 'env', {
	configurable: true,
	value: (key: string) => Cypress.expose(key),
});

registerCypressGrep();
require('@shelex/cypress-allure-plugin');