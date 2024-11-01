import { http } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/users/me/unread/:channelId'

const deleteResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.delete(path, deleteResolver)]

export default handlers
