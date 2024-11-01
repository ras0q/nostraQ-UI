import { http, HttpResponse } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import type { Channel, ChannelList } from '@traptitech/traq'
import { SimplePool, kinds } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'
import Nostr, { querySync } from '../../nostr'

const path = '${baseURL}/channels'

const getResolver = async () => {
  const pool = new SimplePool()
  const relayURLs = Object.keys(await Nostr.relays())
  const events = await querySync(pool, relayURLs, [
    {
      kinds: [kinds.ChannelCreation]
    },
    {
      kinds: [kinds.ChannelMetadata]
    }
  ])
  const publicChannels = events.reduce<Channel[]>((channels, e) => {
    switch (e.kind) {
      case kinds.ChannelCreation: {
        const meta = JSON.parse(e.content) as ChannelMetadata
        channels.push({
          id: e.id,
          parentId: null,
          archived: false,
          force: false,
          topic: meta.about ?? '',
          name: meta.name ?? '',
          children: []
        })
        break
      }
      case kinds.ChannelMetadata: {
        const i = channels.findIndex(c => c.id === e.id)
        const channel = channels[i]
        if (i === -1 || !channel) {
          // eslint-disable-next-line no-console
          console.warn('channel not found')
          return channels
        }
        const meta = JSON.parse(e.content) as ChannelMetadata
        channel.topic = meta.about ?? ''
        channel.name = meta.name ?? ''
        channels[i] = channel
      }
    }
    return channels
  }, [])
  const channelList: ChannelList = {
    public: publicChannels,
    dm: []
  }
  return HttpResponse.json(channelList, { status: 200 })
}

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
