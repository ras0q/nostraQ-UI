import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/bots/:botId'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.get(path, getResolver),
  http.delete(path, deleteResolver),
  http.patch(path, patchResolver)
]

export default handlers
