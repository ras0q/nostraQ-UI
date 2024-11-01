import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/webrtc/authenticate'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.post(path, postResolver)]

export default handlers
