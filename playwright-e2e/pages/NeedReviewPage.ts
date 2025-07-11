import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class NeedReviewPage extends BasePage {

    private readonly checkListLink: Locator
    private readonly reviewReasonsList: Locator
    private readonly viewReasonLink: Locator

    constructor(page: Page) {
        super(page)

        this.checkListLink = page.locator('.govuk-details__summary-text')
        this.reviewReasonsList = page.locator('[data-test="review-reasons-list"]')
        this.viewReasonLink = page.getByRole('link', { name: /^View$/ })
    }

    async clickNeedReviewList(): Promise<void> {
        await this.checkListLink.click()
    }

    async reviewResonsListIsVisible(): Promise<boolean> {
        return await this.reviewReasonsList.isVisible()
    }

    async clickViewReasonLink(): Promise<void> {
        await this.viewReasonLink.click()
    }

    async reviewReasonsListContains(text: string): Promise<boolean> {
        return await this.reviewReasonsList.locator(`text=${text}`).isVisible();
    }

}
