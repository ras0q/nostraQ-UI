import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/stamp-palettes'

const getResolver = () => responseUnsupportedYet([])

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
