import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class SelectDateTimePage extends BasePage {
    private readonly availableSlot: Locator
    private readonly showAllSlots: Locator

    constructor(page: Page) {
        super(page)
        this.availableSlot = page.locator('input[type="radio"]')
        this.showAllSlots = page.getByRole('button', { name: 'Show all sections' })
    }

    async selectFirstAvailableSlot(): Promise<void> {
        await this.showAllSlots.first().click()
        const firstAvailableSlot = this.availableSlot.first()
        await firstAvailableSlot.check()
        expect(await firstAvailableSlot.isChecked()).toBeTruthy()
    }
}

