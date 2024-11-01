import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/stamps/:stampId/stats'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.get(path, getResolver)]

export default handlers
