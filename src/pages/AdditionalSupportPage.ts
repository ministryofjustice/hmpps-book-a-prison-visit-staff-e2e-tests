import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class AddtionalSupportPage extends BasePage {
    private readonly additionalSupportRequired: Locator
    private readonly additionalSupportNotRequired: Locator

    constructor(page: Page) {
        super(page)
        this.additionalSupportNotRequired = page.locator("#additionalSupportRequired-2")
        this.additionalSupportRequired = page.locator("#additionalSupportRequired")
    }

    async selectNoAdditionalSupportRequired(): Promise<void> {
        await this.additionalSupportNotRequired.isEnabled()
        await this.additionalSupportNotRequired.check()
        expect(await this.additionalSupportNotRequired.isChecked()).toBeTruthy()
    }
    async selectAdditionalSupportRequired(): Promise<void> {
        await this.additionalSupportRequired.isEnabled()
        await this.additionalSupportRequired.check()
        expect(await this.additionalSupportRequired.isChecked()).toBeTruthy()
    }

}
