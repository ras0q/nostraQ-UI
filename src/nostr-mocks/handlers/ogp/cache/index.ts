import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/ogp/cache'

const deleteResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [http.delete(path, deleteResolver)]

export default handlers
