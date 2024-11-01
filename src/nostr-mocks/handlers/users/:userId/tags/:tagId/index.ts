import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/:userId/tags/:tagId'

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.patch(path, patchResolver),
  http.delete(path, deleteResolver)
]

export default handlers
