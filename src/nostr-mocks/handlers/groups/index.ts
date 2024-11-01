import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/groups'

const getResolver = () => responseUnsupportedYet([])

const postResolver = () => responseUnsupportedYet([], 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
