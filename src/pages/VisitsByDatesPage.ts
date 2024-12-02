import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class VisitsByDatesPage extends BasePage {
    private readonly viewAnotherDateButton: Locator
    private readonly viewButton: Locator
    private readonly dateErrorLink: Locator
    private readonly dateListLink: Locator
    private readonly bookedOnDateButton: Locator
    private readonly prisonerName: Locator
    private readonly bookedOnDate: Locator
    private readonly prisonerNumber: Locator

    constructor(page: Page) {
        super(page);
        this.viewAnotherDateButton = page.locator('[data-test="another-date-button"]')
        this.viewButton = page.locator('[data-test="submit"]')
        this.dateErrorLink = page.getByRole('link', { name: 'Enter a valid date' })
        this.dateListLink = page.locator('#main-content nav ul li:nth-child(3) a')
        this.bookedOnDateButton = page.getByRole('button', { name: 'Booked on' })
        this.bookedOnDate = page.locator('[data-test="booked-on"]')
        this.prisonerName = page.locator('[data-test="prisoner-name"]')
        this.prisonerNumber = page.locator('[data-test="prisoner-number"]')
    }

    async clickViewAnotherDateButton(): Promise<void> {
        await this.viewAnotherDateButton.click()
    }

    async clickViewButton(): Promise<void> {
        await this.viewButton.click()
    }

    async getInvalidDateErrorMessage(): Promise<string> {
        return await this.dateErrorLink.innerText()
    }

    async clickDateListLink(): Promise<void> {
        await this.dateListLink.click()
    }

    async isBookedOnDateButtonVisible(): Promise<boolean> {
        return await this.bookedOnDateButton.isVisible()
    }

    async getBookedOnDate(): Promise<string> {
        return await this.bookedOnDate.innerText()
    }

    async getPrisonerName(): Promise<string> {
        return await this.prisonerName.innerText()
    }

    async getPrisonerNumber(): Promise<string> {
        return await this.prisonerNumber.innerText()
    }
}
