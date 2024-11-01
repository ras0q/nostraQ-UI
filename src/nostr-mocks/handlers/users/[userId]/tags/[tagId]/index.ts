import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/:userId/tags/:tagId'

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.patch(path, patchResolver),
  http.delete(path, deleteResolver)
]

export default handlers
