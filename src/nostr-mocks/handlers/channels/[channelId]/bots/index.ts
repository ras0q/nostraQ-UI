import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/channels/:channelId/bots'

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.get(path, getResolver)]

export default handlers
