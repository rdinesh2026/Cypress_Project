import InventoryPage from '../pages/InventoryPage';

const specialUsers = ['problem_user', 'error_user', 'visual_user'];

describe('Special demo account smoke coverage', () => {
  specialUsers.forEach((username) => {
    it(`loads the catalog for ${username}`, { tags: ['@regression'] }, () => {
      cy.loginAs(username);
      InventoryPage.visit();
      InventoryPage.productCards.should('have.length', 6);
    });
  });

  it('loads the catalog for performance_glitch_user within the extended timeout', {
    defaultCommandTimeout: 30000,
    tags: ['@regression'],
  }, () => {
    cy.loginAs('performance_glitch_user');
    InventoryPage.visit();
    InventoryPage.productCards.should('have.length', 6);
  });
});