import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class VisitTypePage extends BasePage {

    private readonly visitTypeErrorLink: Locator

    constructor(page: Page) {
        super(page)
        this.visitTypeErrorLink = page.getByRole('link', { name: 'No visit type selected' })
    }

    async getVisitTypeErrorMessage(): Promise<string> {
        const visitTypeErrorMsg = this.visitTypeErrorLink
        return visitTypeErrorMsg.innerText()
    }

}

