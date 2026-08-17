const Page = require('./page');

class CartPage extends Page {
    get btnCheckout() { return $('[data-test="checkout"]'); }

    checkout() {
        return this.btnCheckout.click();
    }
}

module.exports = new CartPage();