import { http, HttpResponse } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import type { Channel, ChannelList } from '@traptitech/traq'
import { SimplePool, kinds } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'
import Nostr, { querySync } from '../../nostr'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/channels'

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
    try {
      switch (e.kind) {
        case kinds.ChannelCreation: {
          const meta = JSON.parse(e.content) as ChannelMetadata
          channels.push({
            id: e.id,
            parentId: null,
            archived: false,
            force: false,
            topic: meta.about ?? '',
            name: meta.name ?? 'UNTITLED',
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }

    return channels
  }, [])

  const nameMap = new Map<string, number>()
  publicChannels.forEach(channel => {
    const name = channel.name
    const count = nameMap.get(name) ?? 0
    nameMap.set(name, count + 1)
    if (count > 0) {
      channel.name = `${name}_${count}`
    }
  })

  const channelList: ChannelList = {
    public: publicChannels,
    dm: []
  }
  return HttpResponse.json(channelList, { status: 200 })
}

const postResolver = () => responseUnsupportedYet(undefined, 403)

const handlers = [http.get(path, getResolver), http.post(path, postResolver)]

export default handlers
