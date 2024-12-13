import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class BookingDetailsPage extends BasePage {
    private readonly cancelVisitButton: Locator

    constructor(page: Page) {
        super(page)
        this.cancelVisitButton = page.locator('[data-test^=cancel-visit]')
    }

    async clickOnCancelBookingButton(): Promise<void> {
        await this.cancelVisitButton.click()
    }

}
