import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/sessions/:sessionId'

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.delete(path, deleteResolver)]

export default handlers
