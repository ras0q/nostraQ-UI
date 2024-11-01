import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/messages/:messageId/pin'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const postResolver = () => responseUnsupportedYet(undefined, 404)

const deleteResolver = () => responseUnsupportedYet(undefined, 404)

const handlers = [
  http.get(path, getResolver),
  http.post(path, postResolver),
  http.delete(path, deleteResolver)
]

export default handlers
