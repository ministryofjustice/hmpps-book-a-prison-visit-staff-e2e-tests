import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class BookingConfirmationPage extends BasePage {
  private readonly bookingConfirmation: Locator
  private readonly managePrisonVisitsButton: Locator
  private readonly cancelTheBookingLink: Locator
  private readonly additionalSupportDetails: Locator
  private readonly prisonerNumber: Locator
  private readonly visitDate: Locator

  constructor(page: Page) {
    super(page)

    this.bookingConfirmation = this.page.locator('[class$=test-booking-reference]')
    this.additionalSupportDetails = page.locator('dl dt:has-text("Additional support requests") + dd')
    this.managePrisonVisitsButton = page.getByRole('button', { name: 'Go to manage prison visits' })
    this.cancelTheBookingLink = page.getByText('cancel or update the booking')
    this.prisonerNumber = this.page.locator('.govuk-summary-list__value.test-visit-prisoner-number')
    this.visitDate = this.page.locator('.govuk-summary-list__value.test-visit-date')
  }

  async displayBookingConfirmation(): Promise<string> {
    const bookingRef = this.bookingConfirmation
    return bookingRef.innerText()
  }

  async getReferenceNumber(): Promise<string> {
    const bookingRef = this.bookingConfirmation
    return bookingRef.innerText()
  }

  async clickOnManagePrisonVisits(): Promise<void> {
    await this.managePrisonVisitsButton.click()
  }

  async clickOnCancelBookingLink(): Promise<void> {
    await this.cancelTheBookingLink.click()
  }

  async getAdditionalDetailsInfo(): Promise<string> {
    return (await this.additionalSupportDetails.locator('p').allInnerTexts()).join(' ')
  }

  async getPrisonerNumber(): Promise<string> {
    const prisonerNum = this.prisonerNumber
    return prisonerNum.innerText()
  }

  async getVisitBookedForDate(): Promise<string> {
    const bookedVisitDate = this.visitDate
    return bookedVisitDate.innerText()
  }

}
