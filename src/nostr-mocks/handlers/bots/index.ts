import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/bots'

const postResolver = () => responseUnsupportedYet([])

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.post(path, postResolver), http.get(path, getResolver)]

export default handlers
