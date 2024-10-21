import { APIRequestContext } from '@playwright/test'
import globalData from '../setup/GlobalData'
import { IApplication } from '../data/IApplication'

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

export const createApplication = async ({ request }: { request: APIRequestContext }, application: IApplication) => {
  const accessToken = globalData.get('authToken')
  const response = await request.put(`${testHelperUri}/test/application/create`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: application,
  })

  const res = {
    status: response.status(),
    applicationRef: await response.text(),
  }
  return res
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
