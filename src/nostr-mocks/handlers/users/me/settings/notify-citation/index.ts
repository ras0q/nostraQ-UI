import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/settings/notify-citation'

const getResolver = () =>
  responseUnsupportedYet(getGetMyNotifyCitation200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
