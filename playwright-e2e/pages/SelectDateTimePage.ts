import { promises } from "dns";
import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class SelectDateTimePage extends BasePage {
    private readonly contextStorage: Map<string, string>; // A simple map to store context data
    private readonly availableSlot: Locator
    private readonly showAllSlots: Locator
    private readonly displayedSlot: Locator
    private readonly visitRestrictionType: Locator
    constructor(page: Page) {
        super(page)
        this.availableSlot = page.locator('input[type="radio"]')
        this.showAllSlots = page.getByRole('button', { name: 'Show all sections' })
        this.displayedSlot = page.locator('label')
        this.contextStorage = new Map()
        this.visitRestrictionType = page.locator('[data-test^=visit-restriction]')
    }

    // Set a value in the context
    async setToContext(key: string, value: string): Promise<void> {
        this.contextStorage.set(key, value) // Store the key-value pair
        console.log(`Context set: ${key} = ${value}`)
    }

    // Get a value from the context
    async getContext(key: string): Promise<string | undefined> {
        const value = this.contextStorage.get(key)
        console.log(`Context retrieved: ${key} = ${value}`)
        return value; // Return the value from storage
    }

    // Clear the context after the test run
    async clearContext(): Promise<void> {
        this.contextStorage.clear()
        console.log("Context cleared.")
    }

    async selectNonAssociationTimeSlot(): Promise<void> {
        const firstAvailableSlot = this.availableSlot.first()
        await firstAvailableSlot.check()
        expect(await firstAvailableSlot.isChecked()).toBeTruthy()
        const slotDetails = await firstAvailableSlot.getAttribute('data-test')
        if (slotDetails) {
            await this.setToContext('SLOT_DATE_TIME', slotDetails)
            // Log the slot details (instead of setting to context)
            console.log(`Selected Slot Date/Time: ${slotDetails}`)
        } else {
            console.error("Error: data-test not found on element time slot RadioButton!")
        }
    }

    async assertLastSelectedDateTimeNotDisplayed(): Promise<void> {
        const slotDateTime = await this.getContext('SLOT_DATE_TIME')
        if (slotDateTime) {
            console.log(`Checking if SLOT_DATE_TIME (${slotDateTime}) is not displayed on the page`)

            // Retrieve all data-test attributes from the radio buttons
            const allRadioButtonDataTest = await this.availableSlot.evaluateAll((buttons) =>
                buttons
                    .map((button) => button.getAttribute('data-test')) // Extract data-test attributes
                    .filter((value): value is string => value !== null) // Remove null values
            )

            const isSlotDisplayed = allRadioButtonDataTest.includes(slotDateTime)

            // Custom assertion with an explicit check and error
            if (isSlotDisplayed) {
                throw new Error(`The SLOT_DATE_TIME value "${slotDateTime}" is displayed on the page.`)
            } else {
                console.log(`Confirmed: SLOT_DATE_TIME value "${slotDateTime}" is not displayed on the page.`)
            }
        } else {
            console.error('SLOT_DATE_TIME is not set in context!')
        }
    }

    async selectFirstAvailableSlot(): Promise<void> {
        // Find all day links in the calendar
        const dayLinks = this.page.locator('a[id^="day-link-"]')

        const count = await dayLinks.count()

        for (let i = 0; i < count; i++) {
            const link = dayLinks.nth(i)

            // Click the calendar day link
            await link.click()

            // Extract the date string from the link ID
            const linkId = await link.getAttribute('id')
            const dayGroupId = linkId?.replace('day-link', 'day-group')

            if (!dayGroupId) continue

            // Locate radio buttons inside the revealed date group
            const slotRadioButtons = this.page.locator(`#${dayGroupId} input[type="radio"]`)

            // Check if at least one slot exists
            if (await slotRadioButtons.count() > 0) {
                const firstAvailableSlot = slotRadioButtons.first()
                await firstAvailableSlot.scrollIntoViewIfNeeded()
                await firstAvailableSlot.check()
                expect(await firstAvailableSlot.isChecked()).toBeTruthy()

                const slotDetails = await firstAvailableSlot.getAttribute('data-test')
                if (slotDetails) {
                    await this.setToContext('SLOT_DATE_TIME', slotDetails)
                    console.log(`Selected Slot Date/Time: ${slotDetails}`)
                } else {
                    console.error("No data-test attribute found on selected slot")
                }

                return // Exit after selecting the first valid slot
            }
        }

        // If no slots were found after checking all days
        throw new Error('No available time slots found for any calendar day')
    }


    async getDisplayedSlots(): Promise<string> {
        const textContent = await this.displayedSlot.allTextContents()
        return textContent.length > 0 ? textContent[0].trim() : ''
    }

    async getSessionCategory(): Promise<string> {
        return await this.visitRestrictionType.innerText()
    }
}
