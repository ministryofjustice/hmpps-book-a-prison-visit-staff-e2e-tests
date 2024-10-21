import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class BookingConfirmationPage extends BasePage {
  private readonly bookingConfirmation: Locator

  constructor(page: Page) {
    super(page)

    this.bookingConfirmation = this.page.locator('[class$=test-booking-reference]')
  }

  async displayBookingConfirmation(): Promise<string> {
    const bookingRef = this.bookingConfirmation
    return bookingRef.innerText()
  }

  async getReferenceNumber(): Promise<string> {
    const bookingRef = this.bookingConfirmation
    return bookingRef.innerText()
  }

}
