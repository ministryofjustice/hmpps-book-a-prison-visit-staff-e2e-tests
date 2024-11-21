import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class VisitsByDatesPage extends BasePage {
    private readonly viewAnotherDateOnCalender: Locator
    private readonly viewButton: Locator
    private readonly dateErrorLink: Locator
    private readonly datelist: Locator
    private readonly bookedOnDateButton: Locator
    private readonly prisonerButton: Locator
    private readonly prisonerName: Locator
    private readonly bookedOnDate: Locator
    private readonly prisonerNumButton: Locator
    private readonly prisonerNum: Locator

    constructor(page: Page) {
        super(page)
        this.viewAnotherDateOnCalender = page.locator('[data-test="another-date-button"]')
        this.viewButton = page.locator('[data-test="submit"]')
        this.dateErrorLink = page.getByRole('link', { name: 'Enter a valid date' })
        this.datelist = page.locator('#main-content nav ul li:nth-child(3) a')
        this.bookedOnDateButton = page.getByRole('button', { name: 'Booked on' })
        this.bookedOnDate = page.locator('[data-test="booked-on"]')
        this.prisonerButton = page.getByRole('button', { name: 'Prisoner name' })
        this.prisonerName = page.locator('[data-test="prisoner-name"]')
        this.prisonerNumButton = page.getByRole('button', { name: 'Prison number' })
        this.prisonerNum = page.locator('[data-test="prisoner-number"]')

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

    async clickOnDateLink(): Promise<void> {
        await this.datelist.click()
    }

    async hasBookedOnDateBtn(): Promise<void> {
        await this.bookedOnDateButton.isVisible()
    }

    async getBookedOnDate(): Promise<string> {
        const visitBookedOn = this.bookedOnDate
        return await visitBookedOn.innerText()
    }

    async getPrisonerName(): Promise<string> {
        await this.prisonerButton.isVisible()
        const prisoner = this.prisonerName
        return await prisoner.innerText()
    }

    async getPrisonerNumber(): Promise<string> {
        await this.prisonerNumButton.isVisible()
        const prisonerNumber = this.prisonerNum
        return await prisonerNumber.innerText()
    }

}
