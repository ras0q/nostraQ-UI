import { http } from 'msw'
import {
  getGetServerVersion200Response,
  responseUnsupportedYet
} from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/version'

const getResolver = () =>
  responseUnsupportedYet(getGetServerVersion200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
