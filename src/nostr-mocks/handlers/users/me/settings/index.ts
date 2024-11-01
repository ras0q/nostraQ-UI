import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/settings'

const getResolver = () =>
  responseUnsupportedYet(getGetUserSettings200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
