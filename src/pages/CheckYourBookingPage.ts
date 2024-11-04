import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class CheckYourBookingPage extends BasePage {
    private readonly submitBooking: Locator
    private readonly mainContactName: Locator

    constructor(page: Page) {
        super(page)
        this.submitBooking = this.page.getByRole('button', { name: 'Submit booking' })
        this.mainContactName = this.page.locator('dl dt:has-text("Main contact") + dd')
    }

    async selectSubmitBooking(): Promise<void> {
        await this.submitBooking.click()
    }

    async getMainContactName(): Promise<string> {
        return (await this.mainContactName.locator('p').allInnerTexts()).join(' ')
    }

}
