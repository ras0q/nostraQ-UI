import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/:userId'

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.patch(path, patchResolver)]

export default handlers
