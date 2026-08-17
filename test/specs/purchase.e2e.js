const LoginPage = require('../pageobjects/login.page');
const InventoryPage = require('../pageobjects/inventory.page');
const CartPage = require('../pageobjects/cart.page');
const CheckoutPage = require('../pageobjects/checkout.page');

const STEP_DELAY = 1500;

describe('Sauce Demo - Compra end to end', () => {
    beforeEach(async () => {
        await LoginPage.open();
        await LoginPage.login('standard_user', 'secret_sauce');
        await browser.pause(STEP_DELAY);
    });

    it('debe completar el flujo de compra con el primer producto del listado', async () => {
        await InventoryPage.addFirstProductToCart();
        await browser.pause(STEP_DELAY);

        await InventoryPage.goToCart();
        await browser.pause(STEP_DELAY);

        await CartPage.checkout();
        await browser.pause(STEP_DELAY);

        await CheckoutPage.fillInfo('Guillermo', 'Test', '00000');
        await browser.pause(STEP_DELAY);

        await CheckoutPage.submitInfo();
        await expect(CheckoutPage.summaryTotal).toBeDisplayed();
        await browser.pause(STEP_DELAY);

        await CheckoutPage.finish();
        await expect(CheckoutPage.completeHeader).toHaveText('Thank you for your order!');
        await browser.pause(STEP_DELAY);

        await CheckoutPage.backToHome();
        await expect(InventoryPage.cartIcon).toBeDisplayed();
    });
});