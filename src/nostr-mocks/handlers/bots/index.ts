import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/bots'

const postResolver = () => responseUnsupportedYet([])

const getResolver = () => responseUnsupportedYet([])

const handlers = [http.post(path, postResolver), http.get(path, getResolver)]

export default handlers
