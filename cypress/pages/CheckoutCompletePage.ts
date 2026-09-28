class CheckoutCompletePage {
  get confirmation() {
    return cy.get('[data-test="complete-header"]');
  }

  backHome() {
    cy.get('[data-test="back-to-products"]').click();
  }

  generatePdf() {
    cy.contains('button', 'Generate PDF order').click();
  }
}

export default new CheckoutCompletePage();