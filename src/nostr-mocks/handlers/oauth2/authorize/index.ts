import { http } from 'msw'
import { responseUnsupported } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/oauth2/authorize'

const getResolver = () => responseUnsupported()

const postResolver = () => responseUnsupported()

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
