import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/clip-folders'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.post(path, postResolver), http.get(path, getResolver)]

export default handlers
