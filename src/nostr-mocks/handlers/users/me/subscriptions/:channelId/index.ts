import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/subscriptions/:channelId'

const putResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.put(path, putResolver)]

export default handlers
