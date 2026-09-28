import products from '../fixtures/products.json';
import CartPage from '../pages/CartPage';
import CheckoutCompletePage from '../pages/CheckoutCompletePage';
import CheckoutInformationPage from '../pages/CheckoutInformationPage';
import CheckoutOverviewPage from '../pages/CheckoutOverviewPage';
import InventoryPage from '../pages/InventoryPage';
import { currencyToCents } from '../support/assertions';

function startCheckout(productNames: string[]) {
  cy.loginAs();
  InventoryPage.visit();
  productNames.forEach((name) => InventoryPage.addProduct(name));
  InventoryPage.openCart();
  CartPage.checkout();
  CheckoutInformationPage.fill('Taylor', 'Tester', '10001');
  CheckoutInformationPage.continue();
}

describe('Checkout purchase', () => {
  it('shows payment, shipping, products, and correct one-item totals', { tags: ['@smoke', '@regression'] }, () => {
    startCheckout([products[0].name]);

    cy.contains('SauceCard #31337').should('be.visible');
    cy.contains('Free Pony Express Delivery!').should('be.visible');
    cy.get('[data-test="inventory-item"]').should('have.length', 1).and('contain', products[0].name);
    CheckoutOverviewPage.subtotal.should(($value) => {
      expect(currencyToCents($value.text())).to.equal(2999);
    });
    CheckoutOverviewPage.tax.should('be.visible');
    CheckoutOverviewPage.total.should(($value) => {
      const total = currencyToCents($value.text());
      const subtotal = currencyToCents(Cypress.$('[data-test="subtotal-label"]').text());
      const tax = currencyToCents(Cypress.$('[data-test="tax-label"]').text());
      expect(total).to.equal(subtotal + tax);
      expect(total).to.equal(3239);
    });
  });

  it('calculates multiple-item subtotal and total from displayed tax', { tags: ['@regression'] }, () => {
    startCheckout([products[1].name, products[4].name]);

    cy.get('[data-test="inventory-item"]').should('have.length', 2);
    CheckoutOverviewPage.subtotal.should(($value) => {
      expect(currencyToCents($value.text())).to.equal(1798);
    });
    CheckoutOverviewPage.total.should(($value) => {
      const subtotal = currencyToCents(Cypress.$('[data-test="subtotal-label"]').text());
      const tax = currencyToCents(Cypress.$('[data-test="tax-label"]').text());
      expect(currencyToCents($value.text())).to.equal(subtotal + tax);
    });
  });

  it('cancels from overview without completing the order', { tags: ['@regression'] }, () => {
    startCheckout([products[0].name]);
    CheckoutOverviewPage.cancel();

    cy.location('pathname').should('eq', '/inventory.html');
    InventoryPage.openCart();
    CartPage.item(products[0].name).should('exist');
  });

  it('finishes the order and resets the cart', { tags: ['@smoke', '@regression'] }, () => {
    startCheckout([products[0].name]);
    CheckoutOverviewPage.finish();

    cy.location('pathname').should('eq', '/checkout-complete.html');
    CheckoutCompletePage.confirmation.should('contain', 'Thank you for your order!');
    cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
  });

  it('returns home from the completion page with an empty cart', { tags: ['@regression'] }, () => {
    startCheckout([products[0].name]);
    CheckoutOverviewPage.finish();
    CheckoutCompletePage.backHome();

    cy.location('pathname').should('eq', '/inventory.html');
    InventoryPage.productCards.should('have.length', products.length);
    cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
  });

  it('keeps the completion page usable after selecting Generate PDF order', { tags: ['@regression'] }, () => {
    startCheckout([products[0].name]);
    CheckoutOverviewPage.finish();
    CheckoutCompletePage.generatePdf();

    CheckoutCompletePage.confirmation.should('contain', 'Thank you for your order!');
  });

  it('characterizes the demo allowing an empty order to complete', { tags: ['@regression'] }, () => {
    cy.loginAs();
    InventoryPage.visit();
    InventoryPage.openCart();
    CartPage.checkout();
    CheckoutInformationPage.fill('Taylor', 'Tester', '10001');
    CheckoutInformationPage.continue();

    CheckoutOverviewPage.subtotal.should('contain', '$0');
    CheckoutOverviewPage.tax.should('contain', '$0.00');
    CheckoutOverviewPage.total.should('contain', '$0.00');
    CheckoutOverviewPage.finish();
    CheckoutCompletePage.confirmation.should('contain', 'Thank you for your order!');
  });
});

describe('Checkout route guards', () => {
  it('does not show the checkout overview or completion page to a logged-out user', { tags: ['@regression'] }, () => {
    cy.visit('/checkout-step-two.html', { failOnStatusCode: false });
    cy.get('[data-test="login-button"]').should('be.visible');
    cy.visit('/checkout-complete.html', { failOnStatusCode: false });
    cy.get('[data-test="login-button"]').should('be.visible');
  });
});