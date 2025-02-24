import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class SelectVisitorPage extends BasePage {
    private readonly visitorCheckboxes: Locator
    private readonly NoSuitableVisitorsMessage: Locator
    private readonly bannedVisitor: Locator

    constructor(page: Page) {
        super(page)
        this.visitorCheckboxes = page.locator('input[type="checkbox"]')
        this.NoSuitableVisitorsMessage = page.locator('[data-test="no-suitable-visitors"]')
        this.bannedVisitor = page.locator('.govuk-visually-hidden')
    }

    async selectFirstVisitor(): Promise<void> {
        const firstCheckbox = this.visitorCheckboxes.first()
        await firstCheckbox.check()
        expect(await firstCheckbox.isChecked()).toBeTruthy()
    }

    async notificationOnPage(reviewReason: string): Promise<void> {
        const text = this.NoSuitableVisitorsMessage
        expect(text).toHaveText(reviewReason)
    }

    async bannedVisitorIsDisabled(bannedVisitorName: string): Promise<void> {
        const name = this.bannedVisitor.filter({ hasText: bannedVisitorName })
        const checkbox = name.locator('input[type="checkbox"]')
        await expect(name).toHaveText(bannedVisitorName)
        await expect(checkbox).toBeHidden()
    }
}

