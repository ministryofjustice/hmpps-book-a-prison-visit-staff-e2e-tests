import { BasePage } from "./BasePage";
import { Locator, Page ,expect} from "@playwright/test"

export default class BlockVisitDatePage extends BasePage {

    private readonly inputDate: Locator
    private readonly selectFullDayRadio: Locator
    private readonly confirmYesRadio: Locator
    private readonly confirmNoRadio: Locator
    private readonly blockedDateStatusMessage: Locator
    private readonly dateBlockedError: Locator
    private readonly unblockDateLink: Locator

    constructor(page: Page) {
        super(page)

        this.inputDate = page.locator('input[id$=date]')
        this.selectFullDayRadio = page.getByRole('radio', { name: 'The full day' })
        this.confirmYesRadio = page.getByLabel('yes')
        this.confirmNoRadio = page.getByLabel('No')
        this.blockedDateStatusMessage = page.locator('.moj-alert__content')
        this.dateBlockedError =page.locator('.govuk-error-summary__body')
        this.unblockDateLink = page.locator('[data-test="unblock-1"]')
    }

    async enterDateToBlock(blockDate: string): Promise<void> {
        await this.inputDate.fill(blockDate)
    }

    async selectFullDay(): Promise<void> {
        await this.selectFullDayRadio.check()
    }

    async confirmBlockDate(): Promise<void> {
        await this.confirmYesRadio.check()
    }

    async confirmationMessage(msg: string): Promise<void> {
        const text = this.blockedDateStatusMessage
        expect(text).toHaveText(msg)
    }

    async errorMsg(errorMsg: string): Promise<void> {
        const text = this.dateBlockedError
        expect(text).toHaveText(errorMsg)
    }

    async unBlockDate(): Promise<void> {
        await this.unblockDateLink.click()
    }


}


