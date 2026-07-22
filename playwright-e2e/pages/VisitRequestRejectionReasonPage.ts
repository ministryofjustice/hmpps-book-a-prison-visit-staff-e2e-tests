import { BasePage } from "./BasePage";
import {Locator, Page } from "@playwright/test"

export default class VisitRequestRejectionReasonPage extends BasePage {
  private readonly confirmRejectButton: Locator

  constructor(page: Page) {
        super(page)
        this.confirmRejectButton = page.getByRole('button', { name: 'Confirm rejection' })
    }

    async clickConfirmRejectionButton(): Promise<void> {
        await this.confirmRejectButton.click()
    }
}
