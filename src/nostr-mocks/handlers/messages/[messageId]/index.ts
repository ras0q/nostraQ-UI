import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/messages/:messageId'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const putResolver = () => responseUnsupportedYet(undefined, 403)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.get(path, getResolver),
  http.put(path, putResolver),
  http.delete(path, deleteResolver)
]

export default handlers
