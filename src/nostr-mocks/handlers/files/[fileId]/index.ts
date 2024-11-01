import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/files/:fileId'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.get(path, getResolver),
  http.delete(path, deleteResolver)
]

export default handlers
