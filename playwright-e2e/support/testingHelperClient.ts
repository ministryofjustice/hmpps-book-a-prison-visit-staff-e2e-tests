import { APIRequestContext } from '@playwright/test'
import globalData from '../setup/GlobalData'

const testHelperUri = process.env.TEST_HELPER_API_URL

export const getAccessToken = async ({ request }: { request: APIRequestContext }) => {
  const basicAuthToken = btoa(`${process.env.TESTING_CLIENT_ID}:${process.env.TESTING_CLIENT_SECRET}`)
  const authUri = `${process.env.HMPPS_AUTH_URL}/oauth/token`

  const response = await request.post(authUri, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuthToken}`,
    },
    form: {
      grant_type: 'client_credentials',
    },
  })
  const data = await response.json()
  return data.access_token
}

export const deleteApplication = async ({ request }: { request: APIRequestContext }, applicationId: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.delete(`${testHelperUri}/test/application/${applicationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const deleteVisit = async ({ request }: { request: APIRequestContext }, visitReference: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.delete(`${testHelperUri}/test/visit/${visitReference}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const deleteTemplate = async ({ request }: { request: APIRequestContext }, visitReference: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.put(`${testHelperUri}/test/template/${visitReference}/delete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const updateVisitStatus = async (
  { request }: { request: APIRequestContext },
  visitReference: string,
  status: string,
) => {
  const accessToken = globalData.get('authToken')
  const response = await request.put(`${testHelperUri}/test/visit/${visitReference}/status/${status}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const cancelVisit = async ({ request }: { request: APIRequestContext }, visitReference: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.post(`${testHelperUri}/test/visit/${visitReference}/cancel`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}


export const clearVisits = async ({ request }: { request: APIRequestContext }, prisonerNumber: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.delete(`${testHelperUri}/test/prisoner/${prisonerNumber}/clear-visits`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const updateModifyTimestamp = async (
  { request }: { request: APIRequestContext },
  applicationReference: string,
  updatedModifyTimestamp: string,
) => {
  const accessToken = globalData.get('authToken')

  const updatedModifiedDate = new Date()
  updatedModifiedDate.setMinutes(updatedModifiedDate.getMinutes() - parseInt(updatedModifyTimestamp))
  const formattedDate = updatedModifiedDate.toISOString().slice(0, 19)
  const uri = `${testHelperUri}/test/application/${applicationReference}/modifiedTimestamp/${formattedDate}`

  console.debug(`Enter updateModifyTimestamp ${uri}`)

  const response = await request.put(uri, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.status()
}

export const updateOpenSessionCapacity = async (
  { request }: { request: APIRequestContext },
  applicationReference: string,
  capacity: number,
) => {
  const accessToken = globalData.get('authToken')
  const response = await request.put(
    `${testHelperUri}/test/application/${applicationReference}/session/capacity/open/${capacity}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return response.status()
}

export const updateClosedSessionCapacity = async (
  { request }: { request: APIRequestContext },
  applicationReference: string,
  capacity: number,
) => {
  const accessToken = globalData.get('authToken')
  const response = await request.put(
    `${testHelperUri}/test/application/${applicationReference}/session/capacity/closed/${capacity}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return response.status()
}

export const createVisit = async ({ request }: { request: APIRequestContext }, applicationReference: string) => {
  const accessToken = globalData.get('authToken')
  const response = await request.post(`${testHelperUri}/test/visit/${applicationReference}/book`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const res = {
    status: response.status(),
    visitRef: await response.text(),
  }
  return res
}

export const excludeDate = async (
  { request }: { request: APIRequestContext },
  prisonCode: string,
  date: Date,
  logger: Console = console // Default to console if no logger is provided
): Promise<number> => {  // Return the status code as a number
  if (!prisonCode) {
    throw new Error("Prison code must not be empty");
  }
  if (!date || isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  logger.debug(`Enter excludeDate: ${date.toISOString()}`);

  const requestBody = { notificationEvent: "PRISON_VISITS_BLOCKED_FOR_DATE" };
  const jsonDate = date.toISOString().split('T')[0]; // Standard ISO format for API calls

  try {
    const accessToken = globalData.get('authToken');
    if (!accessToken) {
      throw new Error('Access token not found');
    }

    const response = await request.put(
      `${testHelperUri}/test/prison/${prisonCode}/add/exclude-date/${jsonDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: requestBody,
      }
    );

    if (!response.ok()) {
      const errorMessage = await response.text();
      throw new Error(
        `Failed to add visit exclude date event for prison ${prisonCode} on ${jsonDate}: ${response.status()} - ${errorMessage}`
      );
    }

    return response.status();  // Return the status code instead of the full response
  } catch (error) {
    logger.error(
      `Failed to add visit exclude date event for prison ${prisonCode} on ${jsonDate}`,
      error
    );
    throw new Error("Failed to add visit exclude date event");
  }
}


export const createSessionTemplate = async (
  { request }: { request: APIRequestContext },
  sessionStartDateTime: Date,
  prisonCode: string,
  weeklyFrequency: number,
  closedCapacity: number,
  openCapacity: number,
  locationLevels: string | null,
  incentive: string | null,
  category: string | null,
  disableAllOtherSessionsForSlotAndPrison: boolean,
  sessionName: string
): Promise<number> => {
  try {
    // Retrieve access token
    const accessToken = globalData.get('authToken')
    if (!accessToken) {
      throw new Error('Access token not found')
    }

    // Prepare the request payload
    const payload = {
      prisonCode,
      sessionStartDateTime: sessionStartDateTime.toISOString(), // Format Date for API
      weeklyFrequency,
      closedCapacity,
      openCapacity,
      locationLevels,
      incentive,
      category,
      disableAllOtherSessionsForSlotAndPrison,
      sessionName
    }

    // Send the PUT request
    const response = await request.put(
      `${testHelperUri}/test/prison/${prisonCode}/template/add`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json', // Ensure correct content type
        },
        data: payload, // Pass the payload
      }
    )

    // Handle response
    if (!response.ok()) {
      const errorMessage = await response.text()
      throw new Error(
        `Failed to create session template: ${response.status()} - ${errorMessage}`
      )
    }

    return response.status()

  } catch (error) {
    console.error('Error in createSessionTemplate:', error)
    throw error;
  }
}

export const getSlotDataTestValue = (localDate: Date, startSlot: number, endSlot: number): string => {
  // Define the start and end times
  const startTime = new Date()
  startTime.setHours(startSlot, 0, 0, 0)

  const endTime = new Date()
  endTime.setHours(endSlot, 0, 0, 0)

  // Define the formatter for "ha" format
  const formatTime = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'pm' : 'am'
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    return `${formattedHours}${ampm}`
  }

  // Format the result
  return `${localDate.toISOString().split('T')[0]} - ${formatTime(startTime)} to ${formatTime(endTime)}`
}


export const removeExcludeDate = async (
  { request }: { request: APIRequestContext },
  prisonCode: string,
  date: Date,
  logger: Console = console // Default to console if no logger is provided
): Promise<number> => {  // Return the status code as a number
  if (!prisonCode) {
    throw new Error("Prison code must not be empty");
  }
  if (!date || isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  logger.debug(`Enter excludeDate: ${date.toISOString()}`);

  const requestBody = { notificationEvent: "PRISON_VISITS_BLOCKED_FOR_DATE" };
  const jsonDate = date.toISOString().split('T')[0]; // Standard ISO format for API calls

  try {
    const accessToken = globalData.get('authToken');
    if (!accessToken) {
      throw new Error('Access token not found');
    }

    const response = await request.put(
      `${testHelperUri}/test/prison/${prisonCode}/remove/exclude-date/${jsonDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: requestBody,
      }
    );

    if (!response.ok()) {
      const errorMessage = await response.text();
      throw new Error(
        `Failed to remove visit exclude date event for prison ${prisonCode} on ${jsonDate}: ${response.status()} - ${errorMessage}`
      );
    }

    return response.status();  // Return the status code instead of the full response
  } catch (error) {
    logger.error(
      `Failed to remove visit exclude date event for prison ${prisonCode} on ${jsonDate}`,
      error
    );
    throw new Error("Failed to remove visit exclude date event");
  }
}

export const releasePrisoner = async ({
  request,
  prisonCode,
  prisonerCode,
  reason
}: { request: APIRequestContext; prisonCode: string; prisonerCode: string; reason: string }) => {
  const accessToken = globalData.get("authToken");

  try {
    const response = await request.put(`${testHelperUri}/test/prisoner/released`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { prisonCode, prisonerCode, reason },
    })

    return { status: response.status() }
  } catch (error) {
    console.error("Error releasing prisoner:", error)
    throw new Error("Failed to release prisoner")
  }
}
