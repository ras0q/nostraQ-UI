import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/unread'

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.get(path, getResolver)]

export default handlers
