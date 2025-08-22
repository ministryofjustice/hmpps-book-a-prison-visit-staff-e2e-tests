import { BasePage } from "./BasePage"
import { Locator, Page, expect } from "@playwright/test"

export default class VisitDetialsPage extends BasePage {
    private readonly alertType: Locator
    private readonly approveVisitBtn: Locator
    private readonly rejectVisitBtn: Locator

    constructor(page: Page) {
        super(page)

        this.alertType = page.locator('[data-test="prisoner-alert-1"]')
        this.approveVisitBtn = page.locator('[data-test^=approve-visit-request]')
        this.rejectVisitBtn = page.locator('[data-test^=reject-visit-request]')

    }

    async displayAlert(alertText: string): Promise<void> {
        const alertStg = this.alertType
        expect(alertStg).toHaveText(alertText)
    }

    async approveVisit(): Promise<void> {
        await this.approveVisitBtn.click()
    }

    async rejectVisit(): Promise<void> {
        await this.rejectVisitBtn.click()
    }

}
