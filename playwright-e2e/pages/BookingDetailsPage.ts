import { BasePage } from "./BasePage"
import { Locator, Page, expect } from "@playwright/test"

export default class BookingDetailsPage extends BasePage {
    private readonly cancelVisitButton: Locator
    private readonly visitNotificationMessage: Locator
    private readonly doNotChangeButton: Locator

    constructor(page: Page) {
        super(page)
        this.cancelVisitButton = page.locator('[data-test^=cancel-visit]')
        this.visitNotificationMessage = page.locator('.moj-alert__content')
        this.doNotChangeButton = page.locator('[data-test^=clear-notifications]')
    }

    async clickOnCancelBookingButton(): Promise<void> {
        await this.cancelVisitButton.click()
    }

    async notificationOnPage(reviewReason: string): Promise<void> {
        const text = this.visitNotificationMessage
        expect(text).toHaveText(reviewReason)
    }

    async clickOnDoNotChangeButton(): Promise<void> {
        await this.doNotChangeButton.click()
    }

    async doNotChangeBtnIsNotDisplayed(): Promise<Boolean> {
        return !(await this.doNotChangeButton.isVisible())
    }
}
