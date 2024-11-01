import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/password'

const putResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.put(path, putResolver)]

export default handlers
