import { BasePage } from "./BasePage";
import { Locator, Page } from "@playwright/test";
import { UserType } from "../support/UserType";

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

    async signInWith(userName: UserType): Promise<void> {
        await this.inputUserName.fill(await this.getUserName(userName))
        await this.inputPassword.fill(process.env.PASSWORD || '')
        await this.signInButton.click()
    }

    private async getUserName(userType: UserType): Promise<string> {
        let userName
        switch (userType) {
            case UserType.USER_ONE:
                userName = process.env.USER_ONE || ''
                break
            case UserType.USER_TWO:
                userName = process.env.USER_TWO || ''
                break
            case UserType.USER_THREE:
                userName = process.env.USER_THREE || ''
                break
            case UserType.USER_FOUR:
                userName = process.env.USER_FOUR || ''
                break
        }

        return userName
    }

}
