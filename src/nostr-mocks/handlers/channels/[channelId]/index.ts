import type { Channel } from '@traptitech/traq'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { kinds, SimplePool } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'
import Nostr, { querySync } from '/@/nostr-mocks/nostr'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'

const path = '${baseURL}/channels/:channelId'

const getResolver: HttpResponseResolver = async ({ params }) => {
  const channelId = params['channelId'] as string
  const pool = new SimplePool()
  const relayURLs = Object.keys(await Nostr.relays())
  const events = await querySync(pool, relayURLs, [
    {
      ids: [channelId],
      kinds: [kinds.ChannelCreation]
    },
    {
      kinds: [kinds.ChannelMetadata],
      '#e': [channelId]
    }
  ])
  let channel: Channel | undefined = undefined
  for (const e of events) {
    switch (e.kind) {
      case kinds.ChannelCreation: {
        if (e.id !== channelId) throw new Error('invalid channelId')
        const meta = JSON.parse(e.content) as ChannelMetadata
        channel = {
          id: e.id,
          parentId: null,
          archived: false,
          force: false,
          topic: meta.about ?? '',
          name: meta.name ?? '',
          children: []
        }
        break
      }
      case kinds.ChannelMetadata: {
        const tag = e.tags.at(0)
        if (tag === undefined) throw new Error('tag not found')
        const [tagType, channelCreateEventId, relayURL, marker] = tag
        if (tagType !== 'e') throw new Error('invalid tag type')
        if (channelCreateEventId !== channelId)
          throw new Error('invalid channelId')
        if (!relayURL || !relayURLs.includes(relayURL))
          throw new Error('invalid relay')
        if (marker !== 'root' && marker !== 'reply')
          throw new Error('invalid marker')
        const meta = JSON.parse(e.content) as ChannelMetadata
        if (channel === undefined) throw new Error('undefined channel')
        channel.topic = meta.about ?? ''
        channel.name = meta.name ?? ''
        break
      }
    }
  }
  if (channel === undefined) throw new Error('channel not found')
  return HttpResponse.json(channel, { status: 200 })
}

const patchResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.patch(path, patchResolver)]

export default handlers
