import { http } from 'msw'
import {
  getGetMyNotifyCitation200Response,
  responseUnsupportedYet
} from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/settings/notify-citation'

const getResolver = () =>
  responseUnsupportedYet(getGetMyNotifyCitation200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
