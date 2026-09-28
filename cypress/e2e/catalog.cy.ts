import products from '../fixtures/products.json';
import InventoryPage from '../pages/InventoryPage';
import ProductPage from '../pages/ProductPage';
import { currencyToCents } from '../support/assertions';

describe('Product catalog', () => {
  beforeEach(() => {
    cy.loginAs();
    InventoryPage.visit();
  });

  it('shows every product with its description, image, and price', { tags: ['@smoke', '@regression'] }, () => {
    InventoryPage.productCards.should('have.length', products.length);

    products.forEach((product) => {
      InventoryPage.productCard(product.name)
        .find('[data-test="inventory-item-desc"]')
        .should('not.be.empty');
      InventoryPage.productCard(product.name).find('img').should('have.attr', 'alt', product.name);
      InventoryPage.productCard(product.name)
        .find('[data-test="inventory-item-price"]')
        .should(($price) => {
        expect(currencyToCents($price.text())).to.equal(Math.round(product.price * 100));
      });
    });
  });

  it('sorts product names from A to Z', { tags: ['@regression'] }, () => {
    InventoryPage.sortBy('az');
    InventoryPage.productNames().then((names) => {
      expect(names).to.deep.equal([...names].sort((a, b) => a.localeCompare(b)));
    });
  });

  it('sorts product names from Z to A', { tags: ['@regression'] }, () => {
    InventoryPage.sortBy('za');
    InventoryPage.productNames().then((names) => {
      expect(names).to.deep.equal([...names].sort((a, b) => b.localeCompare(a)));
    });
  });

  it('sorts prices from low to high', { tags: ['@regression'] }, () => {
    InventoryPage.sortBy('lohi');
    InventoryPage.productPricesInCents().then((prices) => {
      expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
    });
  });

  it('sorts prices from high to low', { tags: ['@regression'] }, () => {
    InventoryPage.sortBy('hilo');
    InventoryPage.productPricesInCents().then((prices) => {
      expect(prices).to.deep.equal([...prices].sort((a, b) => b - a));
    });
  });

  it('opens each product from its name and shows matching details', { tags: ['@regression'] }, () => {
    products.forEach((product) => {
      InventoryPage.openProduct(product.name);
      ProductPage.name.should('have.text', product.name);
      ProductPage.description.should('not.be.empty');
      ProductPage.price.should(($price) => {
        expect(currencyToCents($price.text())).to.equal(Math.round(product.price * 100));
      });
      cy.get('img.inventory_details_img').should('be.visible');
      ProductPage.backToProducts();
      InventoryPage.title.should('contain', 'Products');
    });
  });

  it('adds a product from its detail page', { tags: ['@smoke', '@regression'] }, () => {
    InventoryPage.openProduct(products[0].name);
    ProductPage.addToCartButton.click();
    InventoryPage.cartBadge.should('have.text', '1');
  });

  it('retains cart selection while navigating to product details and back', { tags: ['@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.openProduct(products[0].name);
    ProductPage.backToProducts();

    InventoryPage.cartBadge.should('have.text', '1');
    InventoryPage.productCard(products[0].name).contains('button', 'Remove').should('be.visible');
  });

  it('updates the cart badge when adding and removing separate products', { tags: ['@smoke', '@regression'] }, () => {
    InventoryPage.addProduct(products[0].name);
    InventoryPage.addProduct(products[1].name);
    InventoryPage.cartBadge.should('have.text', '2');

    InventoryPage.removeProduct(products[0].name);
    InventoryPage.cartBadge.should('have.text', '1');
    InventoryPage.productCard(products[0].name).contains('button', 'Add to cart').should('be.visible');
    InventoryPage.productCard(products[1].name).contains('button', 'Remove').should('be.visible');
  });

  it('opens About in a Sauce Labs destination', { tags: ['@regression'] }, () => {
    InventoryPage.openMenu();
    cy.get('[data-test="about-sidebar-link"]').should('have.attr', 'href').and('include', 'saucelabs.com');
  });
});