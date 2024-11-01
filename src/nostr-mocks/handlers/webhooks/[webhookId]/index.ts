import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/webhooks/:webhookId'

const getResolver = () => responseUnsupportedYet(undefined, 404)

const postResolver = () => responseUnsupportedYet(undefined, 403)

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.get(path, getResolver),
  http.post(path, postResolver),
  http.delete(path, deleteResolver),
  http.patch(path, patchResolver)
]

export default handlers
