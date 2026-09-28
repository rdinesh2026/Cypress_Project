class CheckoutInformationPage {
  get firstName() {
    return cy.get('[data-test="firstName"]');
  }

  get lastName() {
    return cy.get('[data-test="lastName"]');
  }

  get postalCode() {
    return cy.get('[data-test="postalCode"]');
  }

  get errorMessage() {
    return cy.get('[data-test="error"]');
  }

  fill(firstName: string, lastName: string, postalCode: string) {
    if (firstName) this.firstName.clear().type(firstName);
    if (lastName) this.lastName.clear().type(lastName);
    if (postalCode) this.postalCode.clear().type(postalCode);
  }

  continue() {
    cy.get('[data-test="continue"]').click();
  }

  cancel() {
    cy.get('[data-test="cancel"]').click();
  }
}

export default new CheckoutInformationPage();