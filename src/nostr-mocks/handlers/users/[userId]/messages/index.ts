import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/:userId/messages'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const getResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.post(path, postResolver), http.get(path, getResolver)]

export default handlers