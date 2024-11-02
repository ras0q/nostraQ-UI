import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/groups/:groupId/admins'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const getResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.post(path, postResolver), http.get(path, getResolver)]

export default handlers
