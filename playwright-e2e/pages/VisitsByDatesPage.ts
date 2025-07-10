import { BasePage } from "./BasePage"
import { expect, Locator, Page } from "@playwright/test"

export default class VisitsByDatesPage extends BasePage {
    private readonly viewAnotherDateButton: Locator;
    private readonly viewButton: Locator
    private readonly dateErrorLink: Locator
    private readonly dateListLink: Locator
    private readonly bookedOnDateButton: Locator
    private readonly bookedOnDate: Locator
    private readonly prisonerName: Locator
    private readonly prisonerNumber: Locator
    private readonly visitRoomName: Locator
    private readonly availableRooms: Locator
    private readonly dateInput: Locator
    private readonly openCalendarButton: Locator

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
        this.visitRoomName = page.locator('[data-test="visit-room-caption"]')
        this.availableRooms = page.locator('h4')
        this.dateInput = page.locator('#date')
        this.openCalendarButton = page.locator('[data-test="another-date-button"]')

    }

    async clickViewAnotherDateButton(): Promise<void> {
        await this.viewAnotherDateButton.waitFor({ state: 'visible' })
        await this.viewAnotherDateButton.click()
    }

    async clickViewButton(): Promise<void> {
        await this.viewButton.waitFor({ state: "visible" })
        await this.viewButton.click()
    }

    async getInvalidDateErrorMessage(): Promise<string> {
        return this.dateErrorLink.innerText()
    }

    async clickDateListLink(): Promise<void> {
        await this.dateListLink.click()
    }

    async isBookedOnDateButtonVisible(): Promise<boolean> {
        return this.bookedOnDateButton.isVisible()
    }

    async getBookedOnDate(): Promise<string> {
        return this.bookedOnDate.first().innerText()
    }

    async getPrisonerName(): Promise<string> {
        return this.prisonerName.first().innerText()
    }

    async getPrisonerNumber(): Promise<string> {
        return this.prisonerNumber.first().innerText()
    }

    async getPrisonerRoomName(): Promise<string> {
        return this.visitRoomName.innerText()
    }

    async getAvailbleRoomsName(): Promise<string> {
        const rooms = await this.availableRooms.textContent()
        return rooms || ''
    }

    async openCalendar() {
        await this.openCalendarButton.click()
        await this.page.waitForTimeout(500)
    }

    async enterBookingDate(formattedDate: string) {
        await this.openCalendar()

        // Wait until input is visible and editable (CI-safe)
        await expect(this.dateInput).toBeVisible({ timeout: 10000 })
        await expect(this.dateInput).toBeEditable({ timeout: 5000 })
        
        // Clear and re-fill (some date pickers resist direct overwrite)
        await this.dateInput.fill('')
        await this.dateInput.fill(formattedDate)
    }
}
