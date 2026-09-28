import LoginPage from '../pages/LoginPage';
import InventoryPage from '../pages/InventoryPage';

const password = Cypress.expose('demoPassword') as string;

describe('Authentication', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  it('logs in with the standard demo account', { tags: ['@smoke', '@regression'] }, () => {
    LoginPage.login('standard_user', password);

    cy.location('pathname').should('eq', '/inventory.html');
    cy.get('[data-test="title"]').should('contain', 'Products');
    cy.get('[data-test="inventory-item"]').should('have.length', 6);
  });

  it('rejects a blank login form', { tags: ['@regression'] }, () => {
    LoginPage.submit();
    LoginPage.errorMessage.should('contain', 'Username is required');
  });

  it('requires a username', { tags: ['@regression'] }, () => {
    cy.get('[data-test="password"]').type(password);
    LoginPage.submit();
    LoginPage.errorMessage.should('contain', 'Username is required');
  });

  it('requires a password', { tags: ['@regression'] }, () => {
    cy.get('[data-test="username"]').type('standard_user');
    LoginPage.submit();
    LoginPage.errorMessage.should('contain', 'Password is required');
  });

  it('rejects unknown credentials', { tags: ['@regression'] }, () => {
    LoginPage.login('unknown_user', password);
    LoginPage.errorMessage.should('contain', 'do not match any user');
  });

  it('rejects an incorrect password', { tags: ['@regression'] }, () => {
    LoginPage.login('standard_user', 'incorrect_password');
    LoginPage.errorMessage.should('contain', 'do not match any user');
  });

  it('rejects the locked-out account', { tags: ['@smoke', '@regression'] }, () => {
    LoginPage.login('locked_out_user', password);
    LoginPage.errorMessage.should('contain', 'locked out');
  });

  it('logs out from the navigation menu', { tags: ['@smoke', '@regression'] }, () => {
    cy.loginAs();
    InventoryPage.visit();
    InventoryPage.openMenu();
    cy.get('[data-test="logout-sidebar-link"]').click();

    LoginPage.loginButton.should('be.visible');
    cy.location('pathname').should('eq', '/');
  });

  it('does not allow direct inventory access while logged out', { tags: ['@regression'] }, () => {
    cy.visit('/inventory.html', { failOnStatusCode: false });

    LoginPage.loginButton.should('be.visible');
    cy.get('[data-test="inventory-item"]').should('not.exist');
  });

  it('keeps an authenticated user on the catalog after reload', { tags: ['@regression'] }, () => {
    cy.loginAs();
    InventoryPage.visit();
    cy.visit('/inventory.html', { failOnStatusCode: false });

    InventoryPage.title.should('contain', 'Products');
    InventoryPage.productCards.should('have.length', 6);
  });

  it('supports keyboard-only login', { tags: ['@regression'] }, () => {
    cy.get('[data-test="username"]').type('standard_user');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should('have.attr', 'data-test', 'password');
    cy.focused().type(password);
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should('have.attr', 'data-test', 'login-button');
    cy.focused().type('{enter}');

    cy.location('pathname').should('eq', '/inventory.html');
  });
});