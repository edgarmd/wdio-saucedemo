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