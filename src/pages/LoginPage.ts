import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test";

export default class LoginPage extends BasePage {
    private readonly signInButton: Locator
    private readonly inputUserName: Locator
    private readonly inputPassword: Locator

    constructor(page: Page) {
        super(page)
        this.signInButton = page.getByRole('button', { name: 'Sign in' })
        this.inputUserName = page.locator('input[id$=username]')
        this.inputPassword = page.locator('input[id$=password]')
    }
    async setAuthCookiesInStorage(path: string): Promise<void> {
        await this.page.context().storageState({ path })
    }

    async signInWith(userName: string, passWord: string): Promise<void> {
        await this.inputUserName.fill(userName)
        await this.inputPassword.fill(passWord)
        await this.signInButton.click()
    }

}