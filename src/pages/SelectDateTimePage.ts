import { promises } from "dns";
import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test"

export default class SelectDateTimePage extends BasePage {
    private readonly contextStorage: Map<string, string>; // A simple map to store context data
    private readonly availableSlot: Locator
    private readonly showAllSlots: Locator
    constructor(page: Page) {
        super(page)
        this.availableSlot = page.locator('input[type="radio"]')
        this.showAllSlots = page.getByRole('button', { name: 'Show all sections' })
        this.contextStorage = new Map()
    }

    // Set a value in the context
    async setToContext(key: string, value: string): Promise<void> {
        this.contextStorage.set(key, value); // Store the key-value pair
        console.log(`Context set: ${key} = ${value}`);
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
        //Click the button to expand aacordion
        await this.showAllSlots.first().click()
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
        await this.showAllSlots.first().click()
        const firstAvailableSlot = this.availableSlot.first()
        await firstAvailableSlot.check()
        expect(await firstAvailableSlot.isChecked()).toBeTruthy()
    }
}
