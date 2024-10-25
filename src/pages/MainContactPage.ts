import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class MainContactPage extends BasePage {
    private readonly mainContactForBooking: Locator
    private readonly ukPhoneNumber: Locator
    private readonly noPhoneNumberRadio: Locator

    constructor(page: Page) {
        super(page)
        this.mainContactForBooking = page.locator("#contact")
        this.ukPhoneNumber = page.locator("#phoneNumber")
        this.noPhoneNumberRadio = page.locator("#phoneNumber-2")
    }

    async selectMainContactForBooking(): Promise<void> {
        await this.mainContactForBooking.isEnabled()
        await this.mainContactForBooking.check()
        expect(await this.mainContactForBooking.isChecked()).toBeTruthy()
    }
    async selectNoPhoneNumberProvided(): Promise<void> {
        await this.noPhoneNumberRadio.isEnabled()
        await this.noPhoneNumberRadio.check()
        expect(await this.noPhoneNumberRadio.isChecked()).toBeTruthy()
    }

    async getMainContactName(): Promise<string> {
        const selectedContact = this.mainContactForBooking
        return await selectedContact.innerText()
    }
}