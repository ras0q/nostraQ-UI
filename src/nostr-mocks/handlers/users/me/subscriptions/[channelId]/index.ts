import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/me/subscriptions/:channelId'

const putResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.put(path, putResolver)]

export default handlers
