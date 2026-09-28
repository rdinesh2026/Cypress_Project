class CheckoutOverviewPage {
  get subtotal() {
    return cy.get('[data-test="subtotal-label"]');
  }

  get tax() {
    return cy.get('[data-test="tax-label"]');
  }

  get total() {
    return cy.get('[data-test="total-label"]');
  }

  finish() {
    cy.get('[data-test="finish"]').click();
  }

  cancel() {
    cy.get('[data-test="cancel"]').click();
  }
}

export default new CheckoutOverviewPage();