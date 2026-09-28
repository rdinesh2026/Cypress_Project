class InventoryPage {
  get title() {
    return cy.get('[data-test="title"]');
  }

  get productCards() {
    return cy.get('[data-test="inventory-item"]');
  }

  get cartBadge() {
    return cy.get('[data-test="shopping-cart-badge"]');
  }

  get cartLink() {
    return cy.get('[data-test="shopping-cart-link"]');
  }

  get menuButton() {
    return cy.get('#react-burger-menu-btn');
  }

  productCard(name: string) {
    return cy
      .get('[data-test="inventory-item"]')
      .filter((_, element) => element.innerText.includes(name))
      .first();
  }

  visit() {
    cy.visit('/inventory.html', { failOnStatusCode: false });
    this.title.should('contain', 'Products');
  }

  productNames() {
    return cy.get('[data-test="inventory-item-name"]').then(($names) =>
      Array.from($names, (element) => element.innerText.trim()),
    );
  }

  productPricesInCents() {
    return cy.get('[data-test="inventory-item-price"]').then(($prices) =>
      Array.from($prices, (element) =>
        Math.round(Number(element.innerText.replace('$', '')) * 100),
      ),
    );
  }

  sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    cy.get('[data-test="product-sort-container"]').select(value);
  }

  addProduct(name: string) {
    this.productCard(name).within(() => {
      cy.contains('button', /^Add to cart$/).click();
    });
  }

  removeProduct(name: string) {
    this.productCard(name).within(() => {
      cy.contains('button', /^Remove$/).click();
    });
  }

  openProduct(name: string) {
    this.productCard(name).find('[data-test="inventory-item-name"]').click();
  }

  openCart() {
    this.cartLink.click();
  }

  openMenu() {
    this.menuButton.click();
  }

  resetAppState() {
    this.openMenu();
    cy.get('[data-test="reset-sidebar-link"]').click();
    cy.get('#react-burger-cross-btn').click();
    cy.visit('/inventory.html', { failOnStatusCode: false });
    this.title.should('contain', 'Products');
  }
}

export default new InventoryPage();