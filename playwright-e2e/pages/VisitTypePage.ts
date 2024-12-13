import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class VisitTypePage extends BasePage {

    private readonly visitTypeErrorLink: Locator
    private readonly selectOpenVisit: Locator
    private readonly selectClosedVisit: Locator

    constructor(page: Page) {
        super(page)
        this.visitTypeErrorLink = page.getByRole('link', { name: 'No visit type selected' })
        this.selectOpenVisit = page.locator('[data-test^=visit-type-open]')
        this.selectClosedVisit = page.locator('[data-test^=visit-type-closed]')
    }

    async getVisitTypeErrorMessage(): Promise<string> {
        const visitTypeErrorMsg = this.visitTypeErrorLink
        return visitTypeErrorMsg.innerText()
    }

    async selectVisitType(visitType: string): Promise<void> {
        switch (visitType) {
            case "open":
                await this.selectOpenVisit.check()
                break
            case "closed":
                await this.selectClosedVisit.check()
                break
            default:
                throw new Error(`Invalid visit type: ${visitType}`)
        }
    }
}

