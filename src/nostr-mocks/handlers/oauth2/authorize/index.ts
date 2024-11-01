import { http } from 'msw'
import { responseUnsupported } from '/@/nostr-mocks/utils'

const path = '${baseURL}/oauth2/authorize'

const getResolver = () => responseUnsupported()

const postResolver = () => responseUnsupported()

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
