import { BasePage } from "./BasePage"
import { Locator, Page, expect } from "@playwright/test"

export default class VisitDetialsPage extends BasePage {
    private readonly alertType: Locator

    constructor(page: Page) {
        super(page)
        this.alertType = page.locator('[data-test="prisoner-alert-1"]')
    }

    async displayAlert(alertText: string): Promise<void> {
        const alertStg = this.alertType
        expect(alertStg).toHaveText(alertText)
    }

}
