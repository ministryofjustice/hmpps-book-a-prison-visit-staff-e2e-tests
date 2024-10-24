import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class SearchPage extends BasePage {
    private readonly prisonerDetailsInput: Locator
    private readonly searchButton: Locator
    private readonly firstPrisonerReturned: Locator

    constructor(page: Page) {
        super(page)
        this.prisonerDetailsInput = page.getByRole('textbox')
        this.searchButton = page.getByRole('button', { name: 'Search' })
        this.firstPrisonerReturned = page.locator('//*[@id="search-results-true"]/tbody/tr/td[1]/a')
    }

    async enterPrisonerNumber(prisonerName: string): Promise<void> {
        await this.prisonerDetailsInput.fill(prisonerName)
        await this.searchButton.last().click()
    }

    async selectPrisonerformResults(): Promise<void> {
        await this.firstPrisonerReturned.click()
    }

}
