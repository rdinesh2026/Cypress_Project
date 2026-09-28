import products from '../fixtures/products.json';
import CartPage from '../pages/CartPage';
import InventoryPage from '../pages/InventoryPage';

describe('Shopping cart', () => {
  beforeEach(() => {
    cy.loginAs();
    InventoryPage.visit();
  });

  it('shows an empty cart when no products are selected', { tags: ['@regression'] }, () => {
    InventoryPage.openCart();
    CartPage.items.should('not.exist');
    CartPage.checkoutButton.should('be.visible');
  });

  it('shows the selected product and matching cart count', { tags: ['@smoke', '@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();

    CartPage.items.should('have.length', 1);
    CartPage.item(products[0].name).should('contain', '$29.99');
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', '1');
  });

  it('shows all selected products exactly once', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.addProduct(products[1].name);
    InventoryPage.openCart();

    CartPage.items.should('have.length', 2);
    CartPage.item(products[0].name).should('exist');
    CartPage.item(products[1].name).should('exist');
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', '2');
  });

  it('removes one cart item without changing the remaining item', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.addProduct(products[1].name);
    InventoryPage.openCart();
    CartPage.removeItem(products[0].name);

    CartPage.items.should('have.length', 1);
    CartPage.item(products[1].name).should('exist');
    CartPage.item(products[0].name).should('not.exist');
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', '1');
  });

  it('removes the final item and clears the cart badge', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    CartPage.removeItem(products[0].name);

    CartPage.items.should('not.exist');
    cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
  });

  it('continues shopping without losing selected products', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    CartPage.continueShopping();

    InventoryPage.title.should('contain', 'Products');
    InventoryPage.productCard(products[0].name).contains('button', 'Remove').should('be.visible');
  });

  it('opens product details from a cart line and retains the cart', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    CartPage.item(products[0].name).find('[data-test="inventory-item-name"]').click();
    cy.get('[data-test="inventory-item-name"]').should('have.text', products[0].name);
    cy.get('[data-test="back-to-products"]').click();
    InventoryPage.cartLink.click();

    CartPage.item(products[0].name).should('exist');
  });

  it('keeps cart contents after reloading the cart page', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openCart();
    cy.reload();

    CartPage.item(products[0].name).should('exist');
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', '1');
  });

  it('keeps cart contents when catalog sort changes', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.sortBy('hilo');
    InventoryPage.cartBadge.should('have.text', '1');
    InventoryPage.openCart();

    CartPage.items.should('have.length', 1);
    CartPage.item(products[0].name).should('exist');
  });
});