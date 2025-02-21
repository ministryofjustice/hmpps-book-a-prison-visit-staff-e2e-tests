import { BasePage } from "./BasePage"
import { Locator, Page, expect } from "@playwright/test"

export default class ClearNotificationPage extends BasePage {
    private readonly confirmYesRadio: Locator
    private readonly reasonDescription: Locator

    constructor(page: Page) {
        super(page)
        this.confirmYesRadio = page.getByLabel('yes')
        this.reasonDescription = page.locator('input[id$=clearReason]')
    }

    async confirmDoNotChange(): Promise<void> {
        await this.confirmYesRadio.check()
        await this.reasonDescription.fill("Automated Test")
    }
}
