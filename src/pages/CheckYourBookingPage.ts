import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"


export default class CheckYourBookingPage extends BasePage {
    private readonly submitBooking: Locator

    constructor(page: Page) {
        super(page)
        this.submitBooking = page.getByRole('button', { name: 'Submit booking' })
    }

    async selectSubmitBooking(): Promise<void> {
        await this.submitBooking.click()
    }
}
