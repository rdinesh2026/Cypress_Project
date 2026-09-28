class CartPage {
  get items() {
    return cy.get('[data-test="inventory-item"]');
  }

  get checkoutButton() {
    return cy.get('[data-test="checkout"]');
  }

  get continueShoppingButton() {
    return cy.get('[data-test="continue-shopping"]');
  }

  item(name: string) {
    return cy.contains('[data-test="inventory-item"]', name);
  }

  removeItem(name: string) {
    this.item(name).within(() => cy.contains('button', /^Remove$/).click());
  }

  checkout() {
    this.checkoutButton.click();
  }

  continueShopping() {
    this.continueShoppingButton.click();
  }
}

export default new CartPage();