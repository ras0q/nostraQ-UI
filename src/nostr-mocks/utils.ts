import { faker } from '@faker-js/faker'
import { HttpResponse, type JsonBodyType } from 'msw'

export const responseUnsupported = (
  body: JsonBodyType = undefined,
  status: number = 400
) => HttpResponse.json(body, { status, statusText: 'Unsupported on nostraQ' })

export const responseUnsupportedYet = (
  body?: JsonBodyType,
  status: number = 200
) => HttpResponse.json(body, { status, statusText: 'Unsupported yet' })

const MAX_ARRAY_LENGTH = 20

export function getGetChannelStats200Response() {
  return {
    totalMessageCount: faker.number.int(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      count: faker.number.int(),
      total: faker.number.int()
    })),
    users: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      messageCount: faker.number.int()
    })),
    datetime: faker.date.past()
  }
}

export function getGetChannelTopic200Response() {
  return {
    topic: faker.lorem.words()
  }
}

export function getGetServerVersion200Response() {
  return {
    revision: faker.lorem.words(),
    version: faker.lorem.words(),
    flags: {
      externalLogin: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.lorem.words()),
      signUpAllowed: faker.datatype.boolean()
    }
  }
}

export function getGetUserSettings200Response() {
  return {
    id: faker.string.uuid(),
    notifyCitation: faker.datatype.boolean()
  }
}

export function getGetMyNotifyCitation200Response() {
  return {
    notifyCitation: faker.datatype.boolean()
  }
}
