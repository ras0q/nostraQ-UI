import { http, HttpResponse } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users'

const getResolver = () => responseUnsupportedYet([])

const postResolver = async () => {
  return HttpResponse.json(undefined, {
    status: 403,
    statusText:
      'Cannot create a new account on nostraQ. Please register Nostr key with NIP-07.'
  })
}

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
