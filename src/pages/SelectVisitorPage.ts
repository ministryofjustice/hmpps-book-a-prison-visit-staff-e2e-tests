import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class SelectVisitorPage extends BasePage {
    private readonly visitorCheckboxes: Locator

    constructor(page: Page) {
        super(page)
        this.visitorCheckboxes = page.locator('input[type="checkbox"]')
    }

    async selectFirstVisitor(): Promise<void> {
        const firstCheckbox = this.visitorCheckboxes.first()
        await firstCheckbox.check()
        expect(await firstCheckbox.isChecked()).toBeTruthy()
    }
}