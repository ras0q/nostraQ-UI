import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/messages/:messageId/stamps'

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.get(path, getResolver)]

export default handlers
