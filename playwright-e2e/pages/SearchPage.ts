import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class SearchPage extends BasePage {
    private readonly prisonerDetailsInput: Locator
    private readonly searchButton: Locator
    private readonly firstPrisonerReturned: Locator
    private readonly searchByRefNumLink: Locator
    private readonly visitRefNumber: Locator
    private readonly searchErrorLink: Locator
    private readonly invalidRefError: Locator
    private readonly searchBlockOne: Locator
    private readonly searchBlockTwo: Locator
    private readonly searchBlockThree: Locator
    private readonly searchBlockFour: Locator

    constructor(page: Page) {
        super(page)
        this.prisonerDetailsInput = page.getByRole('textbox')
        this.searchButton = page.getByRole('button', { name: 'Search' })
        // this.firstPrisonerReturned = page.locator('//*[@id="search-results-true"]/tbody/tr/td[1]/a')
        this.firstPrisonerReturned = page.locator('#search-results-true tbody tr td:first-child a')
        this.searchByRefNumLink = page.getByTestId('search-by-reference')
        this.visitRefNumber = page.getByTestId('tab-visits-reference')
        this.searchErrorLink = page.getByRole('link', { name: 'You must enter at least 2' })
        this.invalidRefError = page.getByRole('link', { name: 'Booking reference must be 8' })
        this.searchBlockOne = page.locator('input[id$=searchBlock1]')
        this.searchBlockTwo = page.locator('input[id$=searchBlock2]')
        this.searchBlockThree = page.locator('input[id$=searchBlock3]')
        this.searchBlockFour = page.locator('input[id$=searchBlock4]')
    }

    async enterPrisonerNumber(prisonerName: string): Promise<void> {
        await this.prisonerDetailsInput.fill(prisonerName)
        await this.searchButton.last().click()
    }

    async selectPrisonerfromResults(): Promise<void> {
        await this.firstPrisonerReturned.click()
    }

    async clickOnSearchByBookingRef(): Promise<void> {
        await this.searchByRefNumLink.click()
    }

    async clickOnSearch(): Promise<void> {
        await this.searchButton.last().click()
    }

    async getErrorMessage(): Promise<string> {
        const errorMsg = this.searchErrorLink
        return errorMsg.innerText()
    }

    async getInvalidRefErrorMessage(): Promise<string> {
        const invalidRefErrorMsg = this.invalidRefError
        return invalidRefErrorMsg.innerText()
    }

    async searchWithRefNumber(pt1: string, pt2: string, pt3: string, pt4: string): Promise<void> {
        await this.searchBlockOne.fill(pt1)
        await this.searchBlockTwo.fill(pt2)
        await this.searchBlockThree.fill(pt3)
        await this.searchBlockFour.fill(pt4)
        await this.searchButton.last().click()
    }
}
