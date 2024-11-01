import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import { type UserDetail, UserAccountState } from '@traptitech/traq'
import { SimplePool, kinds, nip19 } from 'nostr-tools'
import Nostr, { querySync, unixtimeToISO } from '/@/nostr-mocks/nostr'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/users/:userId'

const getResolver: HttpResponseResolver = async ({ params }) => {
  const pk = params['userId'] as string
  const pool = new SimplePool()
  const relayURLs = Object.keys(await Nostr.relays())
  const event = (
    await querySync(pool, relayURLs, [
      {
        kinds: [kinds.Metadata],
        authors: [pk]
      }
    ])
  ).at(0)
  if (event === undefined) {
    return HttpResponse.json(undefined, {
      status: 404,
      statusText: 'user not found'
    })
  }
  const content = JSON.parse(event.content) as {
    name: string
    about: string
    picture: string
  } // FIXME: not found on nostr-tools?
  const user: UserDetail = {
    id: pk,
    bio: content.about,
    groups: [],
    tags: [],
    updatedAt: unixtimeToISO(event.created_at),
    lastOnline: null,
    twitterId: '',
    name: nip19.npubEncode(pk).substring(0, 10),
    displayName: content.name,
    iconFileId: content.picture,
    bot: false,
    state: UserAccountState.active,
    homeChannel: null
  }
  return HttpResponse.json(user, { status: 200 })
}

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.patch(path, patchResolver)]

export default handlers
