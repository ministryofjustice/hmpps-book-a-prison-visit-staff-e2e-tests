import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class CheckYourBookingPage extends BasePage {
    private readonly submitBooking: Locator
    private readonly mainContactName: Locator
    private readonly additionalSupportDetails: Locator

    constructor(page: Page) {
        super(page)
        this.submitBooking = this.page.getByRole('button', { name: 'Submit booking' })
        this.mainContactName = this.page.locator('dl dt:has-text("Main contact") + dd')
        this.additionalSupportDetails = page.locator('dl dt:has-text("Additional support requests") + dd')
    }

    async selectSubmitBooking(): Promise<void> {
        await this.submitBooking.click()
    }

    async getMainContactName(): Promise<string> {
        return (await this.mainContactName.locator('p').allInnerTexts()).join(' ')
    }

    async getAdditionalDetailsInfo(): Promise<string> {
        return (await this.additionalSupportDetails.locator('p').allInnerTexts()).join(' ')
    }

}
