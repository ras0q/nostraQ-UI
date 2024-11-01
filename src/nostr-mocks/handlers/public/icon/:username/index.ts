import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/public/icon/:username'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.get(path, getResolver)]

export default handlers
