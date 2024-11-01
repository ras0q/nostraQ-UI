import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/tags/:tagId'

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.delete(path, deleteResolver),
  http.patch(path, patchResolver)
]

export default handlers
