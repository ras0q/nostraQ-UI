import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/groups/:groupId/members'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
