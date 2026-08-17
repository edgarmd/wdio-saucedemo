# WebdriverIO + Page Object Model — Sauce Demo (código mínimo de referencia)

Flujo cubierto: login → agregar el primer producto del listado al carrito → checkout → llenar
first name / last name / postal code → continuar → finish → back to home.

Este archivo es para **leer y entender**, no para copiar/pegar. La meta es escribirlo tú
mismo después, sin verlo, porque entendiste el patrón — no porque lo memorizaste letra por letra.

---

## 0. Comandos (esto es lo que pides a la IA / ejecutas tú en vivo)

```bash
# 1. Crear estructura de carpetas
mkdir -p test/pageobjects test/specs

# 2. Instalar dependencias (esto sí que le pides a la IA que lo corra en paralelo
#    mientras tú hablas — no aporta que lo escribas a mano)
npm install --save-dev @wdio/cli @wdio/local-runner @wdio/mocha-framework @wdio/spec-reporter @wdio/globals webdriverio

# 3. Correr el test (el comando que debes saber sacar tú, de memoria)
npx wdio run wdio.conf.js

npx wdio run wdio.conf.js --spec ./test/specs/purchase.e2e.js

# o si agregas "scripts": { "test": "wdio run ./wdio.conf.js" } en package.json:
npm test
```

No necesitas instalar Chrome ni chromedriver aparte: WebdriverIO v8+/v9 descarga automáticamente
un "Chrome for Testing" compatible la primera vez que corres el test.

---

## 1. `wdio.conf.js` (raíz del proyecto)

Configuración: qué navegador usar, dónde están los specs, y contra qué URL correr.

```js
exports.config = {
    runner: 'local',
    specs: ['./test/specs/**/*.js'],
    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome'
    }],

    logLevel: 'warn',
    baseUrl: 'https://www.saucedemo.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
```

---

## 2. `test/pageobjects/page.js` — clase base

Todo page object hereda de aquí. Evita repetir `browser.url()` en cada página.

```js
module.exports = class Page {
    open(path) {
        return browser.url(path);
    }
};
```

---

## 3. `test/pageobjects/login.page.js`

Nota el patrón: cada locator es un **getter** (`get inputUsername()`), no una variable fija.
Eso evita que WebdriverIO "guarde" un elemento obsoleto (stale) si la página se recarga —
cada vez que llamas `this.inputUsername`, vuelve a buscar el elemento en el DOM actual.

Los selectores usan `[data-test="..."]` en vez de `id` o clases CSS. Razón: `data-test` es un
atributo que existe solo para testing — si el equipo de frontend cambia estilos o reestructura
clases CSS, tu test no se rompe. Es el mismo argumento que usarías en la entrevista si preguntan
"¿por qué elegiste ese selector?".

```js
const Page = require('./page');

class LoginPage extends Page {
    get inputUsername() { return $('[data-test="username"]'); }
    get inputPassword() { return $('[data-test="password"]'); }
    get btnLogin() { return $('[data-test="login-button"]'); }

    async login(username, password) {
        await this.inputUsername.setValue(username);
        await this.inputPassword.setValue(password);
        await this.btnLogin.click();
    }

    open() {
        return super.open('/');
    }
}

module.exports = new LoginPage();
```

---

## 4. `test/pageobjects/inventory.page.js`

`firstProduct` toma el primer elemento de la lista (`$$('.inventory_item')[0]`) en vez de un id
fijo de un producto específico — así el método sirve sin importar qué producto sea el primero
en el listado (tu requisito original: "cualquier producto que esté, el primero").

```js
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
```

---

## 5. `test/pageobjects/cart.page.js`

```js
const Page = require('./page');

class CartPage extends Page {
    get btnCheckout() { return $('[data-test="checkout"]'); }

    checkout() {
        return this.btnCheckout.click();
    }
}

module.exports = new CartPage();
```

---

## 6. `test/pageobjects/checkout.page.js`

`fillInfo` solo llena los campos. `submitInfo` es un método aparte que hace clic en continuar.
Separarlos en dos métodos (en vez de uno solo que llena y hace click) es lo que te permite
insertar una pausa entre "lleno el formulario" y "confirmo" en el spec — un método, una acción.

```js
const Page = require('./page');

class CheckoutPage extends Page {
    get inputFirstName() { return $('[data-test="firstName"]'); }
    get inputLastName() { return $('[data-test="lastName"]'); }
    get inputPostalCode() { return $('[data-test="postalCode"]'); }
    get btnContinue() { return $('[data-test="continue"]'); }
    get btnFinish() { return $('[data-test="finish"]'); }
    get btnBackHome() { return $('[data-test="back-to-products"]'); }
    get completeHeader() { return $('[data-test="complete-header"]'); }
    get summaryTotal() { return $('[data-test="total-label"]'); }

    async fillInfo(firstName, lastName, postalCode) {
        await this.inputFirstName.setValue(firstName);
        await this.inputLastName.setValue(lastName);
        await this.inputPostalCode.setValue(postalCode);
    }

    submitInfo() {
        return this.btnContinue.click();
    }

    finish() {
        return this.btnFinish.click();
    }

    backToHome() {
        return this.btnBackHome.click();
    }
}

module.exports = new CheckoutPage();
```

---

## 7. `test/specs/purchase.e2e.js` — el test

`STEP_DELAY` es una pausa deliberada entre pasos, **solo para que puedas ver cada pantalla en
vivo** (en un test real de CI no la pondrías — ahí quieres velocidad, no contemplación). Es
válido explicar esto si te preguntan: "la agregué para la demo, en un pipeline real la quitaría".

```js
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
```

---

## Orden sugerido para practicar

1. Lee todo el archivo una vez, de corrido, sin escribir nada.
2. Ciérralo. Escribe `page.js` y `login.page.js` de memoria (son los más cortos).
3. Ábrelo, compara, corrige.
4. Repite con `inventory.page.js`, `cart.page.js`, `checkout.page.js`.
5. Por último, escribe el spec completo encadenando los 4 page objects.
6. Corre `npm test` cada vez que termines — el error de WDIO te dice exactamente qué falló
   (selector, método, o import), y eso también es parte de lo que se evalúa en vivo.



npx wdio run wdio.conf.js --spec ./test/specs/purchase.e2e.js
