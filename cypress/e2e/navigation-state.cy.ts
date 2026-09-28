import products from '../fixtures/products.json';
import CartPage from '../pages/CartPage';
import InventoryPage from '../pages/InventoryPage';

describe('Navigation and application state', () => {
  beforeEach(() => {
    cy.loginAs();
    InventoryPage.visit();
  });

  it('opens and closes the navigation menu', { tags: ['@regression'] }, () => {
    InventoryPage.openMenu();
    cy.get('[data-test="logout-sidebar-link"]').should('be.visible');
    cy.get('#react-burger-cross-btn').click();
    cy.get('[data-test="logout-sidebar-link"]').should('not.be.visible');
  });

  it('returns to All Items without losing the cart', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    InventoryPage.openMenu();
    cy.get('[data-test="inventory-sidebar-link"]').click();

    cy.location('pathname').should('eq', '/inventory.html');
    InventoryPage.cartBadge.should('have.text', '1');
  });

  it('resets selected products using Reset App State', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.resetAppState();

    InventoryPage.cartBadge.should('not.exist');
    InventoryPage.productCard(products[0].name).contains('button', 'Add to cart').should('be.visible');
  });

  it('provides accessible names for critical controls', { tags: ['@regression'] }, () => {
    cy.get('[data-test="shopping-cart-link"]')
      .should('have.attr', 'aria-label')
      .and('match', /^Cart/);
    cy.get('[data-test="product-sort-container"]').should('have.attr', 'aria-label');
    InventoryPage.productCard(products[0].name).contains('button', 'Add to cart').should('be.visible');
  });

  it('keeps catalog and cart controls usable at a narrow viewport', { tags: ['@regression'] }, () => {
    cy.viewport(390, 844);
    InventoryPage.visit();

    InventoryPage.productCard(products[0].name).should('be.visible');
    InventoryPage.productCard(products[0].name).contains('button', 'Add to cart').should('be.visible');
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    CartPage.item(products[0].name).should('be.visible');
    CartPage.checkoutButton.should('be.visible');
  });
});