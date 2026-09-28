import LoginPage from '../pages/LoginPage';

Cypress.Commands.add('loginAs', (username = 'standard_user') => {
  const password = Cypress.expose('demoPassword') as string;

  cy.session(username, () => {
    cy.visit('/');
    LoginPage.login(username, password);
    cy.get('[data-test="title"]').should('contain', 'Products');
  });
});

declare global {
  namespace Cypress {
    interface TestConfigOverrides {
      tags?: ('@smoke' | '@regression')[];
    }

    interface Chainable {
      loginAs(username?: string): Chainable<void>;
    }
  }
}

export {};