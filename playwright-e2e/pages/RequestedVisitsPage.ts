import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test"

export default class RequestedVisitsPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }
    async clickViewLinkForPrisoner(prisonNumber: string) {
        await this.page
            .getByRole('row', { name: new RegExp(prisonNumber) })
            .getByRole('link', { name: 'View' })
            .click();
    }

}
