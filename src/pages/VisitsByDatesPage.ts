import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class VisitsByDatesPage extends BasePage {
    private readonly viewAnotherDateOnCalender: Locator
    private readonly viewButton: Locator
    private readonly dateErrorLink : Locator

    constructor(page: Page) {
        super(page)
        this.viewAnotherDateOnCalender = page.locator('[data-test="another-date-button"]')
        this.viewButton = page.locator('[data-test="submit"]')
        this.dateErrorLink = page.getByRole('link', { name: 'Enter a valid date' })
    }

    async clickOncViewAnotherDate(): Promise<void> {
        await this.viewAnotherDateOnCalender.click()
    }

    async clickOncViewButton(): Promise<void> {
        await this.viewButton.click()
    }

    async getInvalidDateErrorMessage(): Promise<string> {
        const dateErrorMsg = this.dateErrorLink
        return dateErrorMsg.innerText()
    }

}

