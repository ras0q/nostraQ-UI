import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/qr-code'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.get(path, getResolver)]

export default handlers
