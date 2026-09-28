import products from '../fixtures/products.json';
import CartPage from '../pages/CartPage';
import CheckoutInformationPage from '../pages/CheckoutInformationPage';
import InventoryPage from '../pages/InventoryPage';

describe('Checkout information', () => {
  beforeEach(() => {
    cy.loginAs();
    InventoryPage.visit();
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    CartPage.checkout();
  });

  it('requires all checkout information', { tags: ['@smoke', '@regression'] }, () => {
    CheckoutInformationPage.continue();
    CheckoutInformationPage.errorMessage.should('contain', 'First Name is required');
    cy.location('pathname').should('eq', '/checkout-step-one.html');
  });

  it('requires a last name when first name is provided', { tags: ['@regression'] }, () => {
    CheckoutInformationPage.fill('Taylor', '', '');
    CheckoutInformationPage.continue();
    CheckoutInformationPage.errorMessage.should('contain', 'Last Name is required');
  });

  it('requires a postal code when names are provided', { tags: ['@regression'] }, () => {
    CheckoutInformationPage.fill('Taylor', 'Tester', '');
    CheckoutInformationPage.continue();
    CheckoutInformationPage.errorMessage.should('contain', 'Postal Code is required');
  });

  it('accepts punctuation and international characters in name fields', { tags: ['@regression'] }, () => {
    CheckoutInformationPage.fill("Mary-Jane O'Neil", '王 Tester', '10001');
    CheckoutInformationPage.continue();
    cy.location('pathname').should('eq', '/checkout-step-two.html');
    cy.get('[data-test="title"]').should('contain', 'Overview');
  });

  it('cancels checkout information and returns to the cart', { tags: ['@regression'] }, () => {
    CheckoutInformationPage.cancel();
    cy.location('pathname').should('eq', '/cart.html');
    CartPage.item(products[0].name).should('exist');
  });
});