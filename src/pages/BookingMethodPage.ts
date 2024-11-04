import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class BookingMethodPage extends BasePage {
    private readonly bookingMethodRadioButton: Locator

    constructor(page: Page) {
        super(page)
        this.bookingMethodRadioButton = page.locator('input[type="radio"]')
    }

    async selectBookingMethod(): Promise<void> {
        const ChosenBookingOption = this.bookingMethodRadioButton.first()
        await ChosenBookingOption.check()
        expect(ChosenBookingOption.isChecked()).toBeTruthy()
    }
}
