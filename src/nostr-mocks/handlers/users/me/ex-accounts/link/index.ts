import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/ex-accounts/link'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.post(path, postResolver)]

export default handlers
