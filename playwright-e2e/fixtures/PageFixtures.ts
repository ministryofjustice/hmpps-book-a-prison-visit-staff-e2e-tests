import { test as baseTest, expect } from '@playwright/test'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import SearchPage from '../pages/SearchPage'
import PrisonerDetailsPage from '../pages/PrisonerDetailsPage'
import SelectVisitorPage from '../pages/SelectVisitorPage'
import SelectDateTimePage from '../pages/SelectDateTimePage'
import AdditionalSupportPage from '../pages/AdditionalSupportPage'
import MainContactPage from '../pages/MainContactPage'
import BookingMethodPage from '../pages/BookingMethodPage'
import CheckYourBookingPage from '../pages/CheckYourBookingPage'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import BookingDetailsPage from '../pages/BookingDetailsPage'
import CancellationPage from '../pages/CancellationPage'
import VisitsByDatesPage from '../pages/VisitsByDatesPage'
import VisitTypePage from '../pages/VisitTypePage'
import BlockVisitDatePage from '../pages/BlockVisitDatePage'
import NeedReviewPage from '../pages/NeedReviewPage'
import ClearNotificationPage from '../pages/ClearNotificationPage'
import VisitDetialsPage from '../pages/VisitDetailsPage'
import RequestedVisitsPage from '../pages/RequestedVisitsPage'


type PageFixtures = {
    loginPage: LoginPage
    homePage: HomePage
    searchPage: SearchPage
    prisonerDetailsPage: PrisonerDetailsPage
    selectorVisitorPage: SelectVisitorPage
    selectDateTimePage: SelectDateTimePage
    additionalSupportPage: AdditionalSupportPage
    mainContactPage: MainContactPage
    bookingMethodPage: BookingMethodPage
    checkYourBookingPage: CheckYourBookingPage
    bookingConfirmationPage: BookingConfirmationPage
    bookingDetailsPage: BookingDetailsPage
    cancellationPage: CancellationPage
    visitByDatesPage: VisitsByDatesPage
    visitTypePage: VisitTypePage
    blockVisitDatePage: BlockVisitDatePage
    needReviewPage: NeedReviewPage
    clearNotificationPage: ClearNotificationPage
    visitDetailsPage: VisitDetialsPage
    requestedVisitsPage: RequestedVisitsPage

}

const test = baseTest.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page))
    },

    searchPage: async ({ page }, use) => {
        await use(new SearchPage(page))
    },

    prisonerDetailsPage: async ({ page }, use) => {
        await use(new PrisonerDetailsPage(page))
    },

    selectorVisitorPage: async ({ page }, use) => {
        await use(new SelectVisitorPage(page))
    },

    selectDateTimePage: async ({ page }, use) => {
        await use(new SelectDateTimePage(page))
    },

    additionalSupportPage: async ({ page }, use) => {
        await use(new AdditionalSupportPage(page))
    },

    mainContactPage: async ({ page }, use) => {
        await use(new MainContactPage(page))
    },

    bookingMethodPage: async ({ page }, use) => {
        await use(new BookingMethodPage(page))
    },

    checkYourBookingPage: async ({ page }, use) => {
        await use(new CheckYourBookingPage(page))
    },

    bookingConfirmationPage: async ({ page }, use) => {
        await use(new BookingConfirmationPage(page))
    },

    bookingDetailsPage: async ({ page }, use) => {
        await use(new BookingDetailsPage(page))
    },

    cancellationPage: async ({ page }, use) => {
        await use(new CancellationPage(page))
    },

    visitByDatesPage: async ({ page }, use) => {
        await use(new VisitsByDatesPage(page))
    },

    visitTypePage: async ({ page }, use) => {
        await use(new VisitTypePage(page))
    },

    blockVisitDatePage: async ({ page }, use) => {
        await use(new BlockVisitDatePage(page))
    },

    needReviewPage: async ({ page }, use) => {
        await use(new NeedReviewPage(page))
    },

    clearNotificationPage: async ({ page }, use) => {
        await use(new ClearNotificationPage(page))
    },

    visitDetailsPage: async ({ page }, use) => {
        await use(new VisitDetialsPage(page))
    },

    requestedVisitsPage: async ({ page }, use) => {
        await use(new RequestedVisitsPage(page))
    }

})

export { test, expect }
