import { http, HttpResponse } from 'msw'
import { responseUnsupportedYet } from '/@/nostr-mocks/utils'
import type { Channel, ChannelList } from '@traptitech/traq'
import { SimplePool, kinds } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'
import Nostr, { querySync } from '../../nostr'
import { BASE_PATH } from '/@/lib/apis'
import { ulid } from 'ulid'

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

  // Split channels that contain '/' into nested channels
  const nestedChannels = publicChannels.filter(c => c.name.includes('/'))
  for (const nestedChannel of nestedChannels) {
    const paths = nestedChannel.name.split('/')

    let child: Channel | null = null
    for (let i = paths.length - 1; i >= 0; i--) {
      const fullpath = paths.slice(0, i + 1).join('/')
      const channel = publicChannels.find(c => c.name === fullpath)

      if (channel === undefined) {
        const newChannel: Channel = {
          id: ulid(),
          parentId: null,
          archived: false,
          force: false,
          topic: '',
          name: fullpath,
          children: child ? [child.id] : []
        }
        publicChannels.push(newChannel)
        if (child) {
          child.parentId = newChannel.id
        }
        child = newChannel
      } else {
        if (child) {
          child.parentId = channel.id
          if (!channel.children.includes(child.id)) {
            channel.children.push(child.id)
          }
        }
        child = channel
      }
    }
  }

  for (const channel of publicChannels) {
    const basename = channel.name.split('/').at(-1)
    if (basename) {
      channel.name = basename
    }
  }

  // Prevent duplicate channel names
  const nameMap = new Map<string, number>()
  publicChannels.forEach(channel => {
    const key = `${channel.parentId ?? ''}_${channel.name}`
    const count = nameMap.get(key) ?? 0
    nameMap.set(key, count + 1)
    if (count > 0) {
      channel.name = `${channel.name}_${count}`
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
