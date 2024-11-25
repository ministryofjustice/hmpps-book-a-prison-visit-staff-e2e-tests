import { es } from "date-fns/locale"
import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class HomePage extends BasePage {
    private readonly bookOrChangeaVisit: Locator
    private readonly visitsByDateLink: Locator
    private readonly establishmentLink: Locator
    private readonly establishmentName: Locator 
    private readonly managePrisonLink : Locator

    constructor(page: Page) {
        super(page)
        this.bookOrChangeaVisit = page.locator('[href*="/search/prisoner"]')
        this.visitsByDateLink = page.getByRole('link', { name: 'View visits by date' })
        this.establishmentLink = page.locator('[data-test="change-case-load-link"]')
        this.establishmentName = page.locator('#changeCaseloadSelect')
        this.managePrisonLink = page.getByRole('link',{name: 'Manage prison visits'})
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

}

