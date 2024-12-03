# hmpps-book-a-prison-visit-staff-e2e-tests
This repository contains automated E2E UI tests for the `hmpps-book-a-prison-visit-ui` **`(Staff UI)`** service. The tests are written in TypeScript and use the Playwright testing library.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository
2. Navigate to the project directory
```
cd  hmpps-book-a-prison-visit-staff-e2e-tests
```
3. Install the dependencies:
```
npm ci
create 3 .env files
.env, .env.dev & .env.staging
```
# These will be set by the setup script
BASE_URL=''
HMPPS_AUTH_URL=''
TEST_HELPER_API_URL=''
TESTING_CLIENT_ID=''
TESTING_CLIENT_SECRET=''

DEV_USER="dev_user"
DEV_PASSWORD="dev_password"
```

Update `.env.dev & .env.staging` with below values

TESTING_CLIENT_ID=`xxxxxxxxxx`
TESTING_CLIENT_SECRET=`xxxxxxxxx`

## Running the Tests
**All the below scpritps are in package.json**

To run the tests, use the following command:
```
npm run test:chrome                 -   To run the tests on chrome headless
npm run test:chrome:headed          -   To run the tests on chrome in headed mode
```

## Running single test
To run a single test in headed mode use the below command
```
test_env={environment to run the test:dev or staging} npx playwright test --project={browserName} {testName}.spec.ts --headed 

Supported Browsers: 
Chromium
Firefox
Edge
Webkit/Safari
```