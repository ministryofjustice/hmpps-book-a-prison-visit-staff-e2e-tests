import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class CancellationPage extends BasePage {
    private readonly cancellationReason: Locator
    private readonly reasonDescription: Locator
    private readonly cancelBookingButton: Locator

    constructor(page: Page) {
        super(page)
        this.cancellationReason = page.getByLabel('Establishment cancelled')
        this.reasonDescription = page.locator('input[id$=reason]')
        this.cancelBookingButton = page.getByRole('button', { name: 'Cancel booking' })
    }

    async selectEstablishmentCancelled(): Promise<void> {
        await this.cancellationReason.check()
    }

    async enterReason(reason: string): Promise<void> {
        await this.reasonDescription.fill(reason)
        await this.cancelBookingButton.click()
    }
}
