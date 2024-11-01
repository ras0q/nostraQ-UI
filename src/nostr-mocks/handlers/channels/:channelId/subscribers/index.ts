import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/channels/:channelId/subscribers'

const getResolver = () => responseUnsupportedYet([])

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const putResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [
  http.get(path, getResolver),
  http.patch(path, patchResolver),
  http.put(path, putResolver)
]

export default handlers
