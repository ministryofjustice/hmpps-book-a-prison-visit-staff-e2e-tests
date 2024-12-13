import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class PrisonerDetailsPage extends BasePage {
    private readonly bookAPrisonVisit: Locator
    private readonly visitRefNumber: Locator
    private readonly cancelVisitButton: Locator
    private readonly prisonerCategory: Locator
    private readonly prisonerIncentive: Locator


    constructor(page: Page) {
        super(page)
        this.bookAPrisonVisit = page.getByRole('button', { name: 'Book a prison visit' })
        this.cancelVisitButton = page.getByRole('button', { name: 'Cancel booking' })
        this.visitRefNumber = page.locator('[class$=govuk-link--no-visited-state]')
        this.prisonerCategory = page.locator('[data-test^=category]')
        this.prisonerIncentive = page.locator('[data-test^=iep-level]')
    }

    async clickOnBookAPrisonVisit(): Promise<void> {
        await this.bookAPrisonVisit.click()
    }
    async clickOnVisitRefRerenceNumber(): Promise<void> {
        await this.visitRefNumber.last().click()
    }

    async getPrisonerCategory(): Promise<string> {
        return await this.prisonerCategory.innerText()
    }

    async getPrisonerIncentive(): Promise<string> {
        return await this.prisonerIncentive.innerText()
    }

}
