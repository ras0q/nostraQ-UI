import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/messages/:messageId/stamps/:stampId'

const postResolver = () => responseUnsupportedYet(undefined, 403)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.post(path, postResolver),
  http.delete(path, deleteResolver)
]

export default handlers
