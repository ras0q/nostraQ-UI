import { http } from 'msw'
import {
  getGetUserSettings200Response,
  responseUnsupportedYet
} from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/settings'

const getResolver = () =>
  responseUnsupportedYet(getGetUserSettings200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
