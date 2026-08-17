
const Page = require('./page');


class InventoryPage extends Page {
    get cartIcon() { return $('[data-test="shopping-cart-link"]'); }
    get firstProduct() { return $$('.inventory_item')[0]; }

    addFirstProductToCart() {
        return this.firstProduct.$('button').click();

    }

    goToCart() {
        return this.cartIcon.click();
    }
}


module.exports = new InventoryPage();