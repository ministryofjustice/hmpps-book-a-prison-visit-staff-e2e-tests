import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class BookingConfirmationPage extends BasePage {
  private readonly bookingConfirmation: Locator
  private readonly managePrisonVisitsButton: Locator
  private readonly cancelTheBookingLink: Locator

  constructor(page: Page) {
    super(page)

    this.bookingConfirmation = this.page.locator('[class$=test-booking-reference]')
    this.managePrisonVisitsButton = page.getByRole('button', { name: 'Go to manage prison visits' })
    this.cancelTheBookingLink = page.getByText('cancel the booking')
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

}
