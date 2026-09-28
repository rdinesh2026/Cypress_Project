class ProductPage {
  get name() {
    return cy.get('[data-test="inventory-item-name"]');
  }

  get description() {
    return cy.get('[data-test="inventory-item-desc"]');
  }

  get price() {
    return cy.get('[data-test="inventory-item-price"]');
  }

  get addToCartButton() {
    return cy.contains('button', /^Add to cart$/);
  }

  backToProducts() {
    cy.get('[data-test="back-to-products"]').click();
  }
}

export default new ProductPage();