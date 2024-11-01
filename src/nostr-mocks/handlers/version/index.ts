import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/version'

const getResolver = () =>
  responseUnsupportedYet(getGetServerVersion200Response())

const handlers = [http.get(path, getResolver)]

export default handlers
