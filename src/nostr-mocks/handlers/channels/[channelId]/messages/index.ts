import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import Nostr, {
  isoToUnixtime,
  querySync,
  unixtimeToISO
} from '/@/nostr-mocks/nostr'
import { kinds, SimplePool } from 'nostr-tools'
import type { Message } from '@traptitech/traq'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/channels/:channelId/messages'

const getResolver: HttpResponseResolver = async ({ request, params }) => {
  const channelId = params['channelId'] as string
  const query = new URL(request.url).searchParams
  const limit = Number(query.get('limit') ?? '100')
  // const offset = query.get("offset") as unknown as number ?? 0
  const since = query.get('since')
  const until = query.get('until')
  // const inclusive = query.get('inclusive') === 'true'
  const order = query.get('order') === 'asc' ? 'asc' : 'desc'
  const pool = new SimplePool()
  const relayURLs = Object.keys(await Nostr.relays())
  const events = await querySync(pool, relayURLs, [
    {
      kinds: [
        kinds.ChannelMessage,
        kinds.ChannelHideMessage,
        kinds.ChannelMuteUser
      ],
      limit,
      since: since ? isoToUnixtime(since) : undefined,
      until: until ? isoToUnixtime(until) : undefined,
      '#e': [channelId]
    }
  ])
  const messages = events
    .reduce<Message[]>((messages, e) => {
      switch (e.kind) {
        case kinds.ChannelMessage: {
          // TODO: support reply
          // https://github.com/nostr-protocol/nips/blob/master/28.md#:~:text=Reply%20to%20another%20message%3A
          const tag = e.tags.at(0)
          if (tag === undefined) throw 'tag not found'
          const [tagType, channelCreateEventId] = tag
          if (tagType !== 'e') throw `invalid tag type: ${tagType}`
          if (channelCreateEventId !== channelId) throw 'invalid channelId'
          return messages.concat({
            id: e.id,
            userId: e.pubkey,
            channelId: channelCreateEventId,
            content: e.content,
            createdAt: unixtimeToISO(e.created_at),
            updatedAt: unixtimeToISO(e.created_at),
            pinned: false,
            stamps: [],
            threadId: null
          })
        }
        // TODO: implement
        case kinds.ChannelHideMessage: {
          break
        }
        // TODO: implement
        case kinds.ChannelMuteUser: {
          break
        }
      }
      return messages
    }, [])
    .sort((l, r) =>
      l.updatedAt < r.updatedAt ? -1 : l.updatedAt === r.updatedAt ? 0 : 1
    )
  return HttpResponse.json(order === 'asc' ? messages : messages.reverse(), {
    status: 200
  })
}

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
