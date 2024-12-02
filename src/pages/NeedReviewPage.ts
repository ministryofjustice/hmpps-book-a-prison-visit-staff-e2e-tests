import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class NeedReviewPage extends BasePage {

    private readonly checkListLink: Locator
    private readonly reviewReasonsList: Locator

    constructor(page: Page) {
        super(page)

        this.checkListLink = page.locator('.govuk-details__summary-text')
        this.reviewReasonsList = page.locator('[data-test="review-reasons-list"]')
    }

    async clickNeedReviewList(): Promise<void> {
        await this.checkListLink.click()
    }

    async reviewResonsListIsVisible(): Promise<boolean> {
        return await this.reviewReasonsList.isVisible()
    }

}
