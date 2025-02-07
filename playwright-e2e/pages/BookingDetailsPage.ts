import { BasePage } from "./BasePage"
import { Locator, Page, expect } from "@playwright/test"

export default class BookingDetailsPage extends BasePage {
    private readonly cancelVisitButton: Locator
    private readonly visitNotificationMessage: Locator

    constructor(page: Page) {
        super(page)
        this.cancelVisitButton = page.locator('[data-test^=cancel-visit]')
        this.visitNotificationMessage = page.locator('[data-test^=visit-notification]')
    }

    async clickOnCancelBookingButton(): Promise<void> {
        await this.cancelVisitButton.click()
    }

     async notificationOnPage(reviewReason: string): Promise<void> {
            const text = this.visitNotificationMessage
            expect(text).toHaveText(reviewReason)
        }

}
