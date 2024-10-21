import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"


export default class ConfirmationPage extends BasePage {
    private readonly bookingReferenceNumber: Locator

    constructor(page: Page) {
        super(page)
        // this.bookingReferenceNumber = page.getByRole('button', { name: 'Submit booling' })
    }

    // async selectSubmitBooking(): Promise<void> {
    //     await this.submitBooking.click()
    // }
}
