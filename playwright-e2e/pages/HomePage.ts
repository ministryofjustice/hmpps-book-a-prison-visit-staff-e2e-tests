import { es } from "date-fns/locale"
import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class HomePage extends BasePage {
    private readonly bookOrChangeaVisit: Locator
    private readonly visitsByDateLink: Locator
    private readonly establishmentLink: Locator
    private readonly establishmentName: Locator
    private readonly managePrisonLink: Locator
    private readonly blockVisitDates: Locator
    private readonly needReviewLink: Locator
    private readonly requestedVisitsLink: Locator

    constructor(page: Page) {
        super(page)
        this.bookOrChangeaVisit = page.locator('[href*="/search/prisoner"]')
        this.visitsByDateLink = page.getByRole('link', { name: 'View visits by date' })
        this.establishmentLink = page.locator('[data-qa=cdps-header-caseload]')
        this.establishmentName = page.locator('#changeCaseloadSelect')
        this.managePrisonLink = page.getByRole('link', { name: 'Social visits' })
        this.blockVisitDates = page.getByRole('link', { name: 'Block visit dates or sessions' })
        this.needReviewLink = page.locator('[href*="/review"]')
        this.requestedVisitsLink = page.getByRole('link', { name: 'Requested visits' })

    }

    async displayBookOrChangeaVisit(): Promise<void> {
        await this.bookOrChangeaVisit.isVisible()
    }

    async selectBookOrChangeVisit(): Promise<void> {
        await this.bookOrChangeaVisit.click()
    }
    async clickOnVisitsByDate(): Promise<void> {
        await this.visitsByDateLink.click()
    }

    async clickOnChangeEstablishment(): Promise<void> {
        await this.establishmentLink.click()
    }

    async selectEstablishment(estName: string): Promise<void> {
        await this.establishmentName.selectOption(estName)
    }

    async clickOnManagePrisonVisits(): Promise<void> {
        await this.managePrisonLink.nth(0).click()
    }

    async clickOnBlockVisitDates(): Promise<void> {
        await this.blockVisitDates.click()
    }

    async clickNeedReview(): Promise<void> {
        await this.needReviewLink.click()
    }

    async clickOnRequestedVisits(): Promise<void> {
        await this.requestedVisitsLink.click()
    }

}
