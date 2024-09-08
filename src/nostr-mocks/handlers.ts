// generated with following command
// $ npx msw-auto-mock https://raw.githubusercontent.com/traPtitech/traQ/master/docs/v3-api.yaml -o ./src/nostr-mocks

import { faker } from '@faker-js/faker'
import type {
  Channel,
  ChannelList,
  ChannelViewState,
  Message,
  MyUserDetail,
  UserDetail
} from '@traptitech/traq'
import { UserAccountState, UserPermission } from '@traptitech/traq'
import { HttpResponse, http, ws, type JsonBodyType } from 'msw'
import { kinds, nip19 } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'
import { SimplePool } from 'nostr-tools/pool'
import type { WebSocketEvent } from '../lib/websocket/events'
import type { WebSocketCommand } from '../lib/websocket/send'
import Nostr, { isoToUnixtime, querySync, unixtimeToISO } from './nostr'
import { BASE_PATH, WEBSOCKET_ENDPOINT } from '/@/lib/apis'

faker.seed(1)

const baseURL = BASE_PATH
const MAX_ARRAY_LENGTH = 20

const responseUnsupported = (
  body: JsonBodyType = undefined,
  status: number = 400
) => HttpResponse.json(body, { status, statusText: 'Unsupported on nostraQ' })

const responseUnsupportedYet = (body?: JsonBodyType, status: number = 200) =>
  HttpResponse.json(body, { status, statusText: 'Unsupported yet' })

const documentURL = new URL(document.URL)
const wsConn = ws.link(
  `${documentURL.protocol === 'https' ? 'wss' : 'ws'}://${
    documentURL.host
  }${WEBSOCKET_ENDPOINT}`
)

const sendWsEvent = <T extends keyof WebSocketEvent>(
  clients: typeof wsConn.clients,
  event: {
    type: T
    body: WebSocketEvent[T]
  }
) => {
  const json = JSON.stringify(event)
  clients.forEach(c => c.send(json))
}

export const handlers = [
  wsConn.on('connection', ({ client }) => {
    client.addEventListener('message', e => {
      const clientSet = new Set([client])
      const [command, ...args] = e.data.toString().split(':')
      switch (command as WebSocketCommand) {
        case 'viewstate': {
          if (args.length < 2) return

          const [channelId, state] = args
          if (!channelId || !state) throw 'Invalid args'

          sendWsEvent(clientSet, {
            type: 'USER_VIEWSTATE_CHANGED',
            body: {
              view_states: [
                {
                  key: faker.string.uuid(),
                  channelId: channelId,
                  state: state as ChannelViewState
                }
              ]
            }
          })
          break
        }

        case 'rtcstate': {
          const [channelId, ...states] = args
          if (!channelId) throw 'Invalid args'

          sendWsEvent(clientSet, {
            type: 'USER_WEBRTC_STATE_CHANGED',
            body: {
              user_id: client.id,
              channel_id: channelId,
              sessions: states
                .flatMap((_, i, s) => (i % 2 === 0 ? [s.slice(i, i + 2)] : []))
                .map(([state, sessionId]) => ({
                  state: state ?? '',
                  sessionId: sessionId ?? ''
                }))
            }
          })
          break
        }

        case 'timeline_streaming': {
          break
        }

        default: {
          throw 'Unknown command'
        }
      }
    })
  }),
  http.post(`${baseURL}/channels/:channelId/messages`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(
    `${baseURL}/channels/:channelId/messages`,
    async ({ request, params }) => {
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

      return HttpResponse.json(
        order === 'asc' ? messages : messages.reverse(),
        { status: 200 }
      )
    }
  ),
  http.get(`${baseURL}/messages`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/messages/:messageId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/messages/:messageId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/messages/:messageId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.post(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/stats`, () =>
    responseUnsupportedYet(getGetChannelStats200Response())
  ),
  http.get(`${baseURL}/channels/:channelId/topic`, () =>
    responseUnsupportedYet(getGetChannelTopic200Response())
  ),
  http.put(`${baseURL}/channels/:channelId/topic`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/channels/:channelId/viewers`, () =>
    responseUnsupportedYet([])
  ),
  http.post(`${baseURL}/files`, () => responseUnsupportedYet(undefined, 403)),
  http.get(`${baseURL}/files`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/files/:fileId/meta`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/files/:fileId/thumbnail`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/files/:fileId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/files/:fileId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  // TODO: https://github.com/nostr-protocol/nips/blob/master/51.md
  http.get(`${baseURL}/channels/:channelId/pins`, () =>
    responseUnsupportedYet([])
  ),
  http.get(`${baseURL}/messages/:messageId/stamps`, () =>
    responseUnsupportedYet([])
  ),
  http.post(`${baseURL}/messages/:messageId/stamps/:stampId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/messages/:messageId/stamps/:stampId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/stamps`, () => responseUnsupportedYet(undefined, 403)),
  http.get(`${baseURL}/stamps`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/users/me/stamp-history`, () =>
    responseUnsupportedYet([])
  ),
  http.get(`${baseURL}/users/me/qr-code`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/stamps/:stampId/stats`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  // NOTE: /users/:userId より優先するために前に置いている
  http.get(`${baseURL}/users/me`, async () => {
    const pk = await Nostr.publicKey()
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
    const me: MyUserDetail = {
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
      permissions: Object.values(UserPermission), // TODO: filter perm
      homeChannel: null
    }

    return HttpResponse.json(me, { status: 200 })
  }),
  http.patch(`${baseURL}/users/me`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId`, async ({ params }) => {
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
  }),
  http.patch(`${baseURL}/users/:userId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/groups/:groupId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/groups/:groupId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.put(`${baseURL}/groups/:groupId/icon`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId/members`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.post(`${baseURL}/groups/:groupId/members`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/groups/:groupId/members/:userId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/groups/:groupId/members/:userId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/groups`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/groups`, () => responseUnsupportedYet([], 403)),
  http.get(`${baseURL}/users/me/oidc`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/users/:userId/messages`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/messages`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/users/:userId/stats`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupportedYet([])
  ),
  http.patch(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.put(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/subscriptions`, () =>
    responseUnsupportedYet([])
  ),
  http.put(`${baseURL}/users/me/subscriptions/:channelId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/webhooks`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.post(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks/:webhookId/icon`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/webhooks/:webhookId/icon`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/icon`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/users/:userId/icon`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/icon`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/users/me/icon`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.put(`${baseURL}/users/me/password`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.put(`${baseURL}/users/:userId/password`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/users/me/fcm-device`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/view-states`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/users`, async () => {
    return HttpResponse.json(undefined, {
      status: 403,
      statusText:
        'Cannot create a new account on nostraQ. Please register Nostr key with NIP-07.'
    })
  }),
  http.get(`${baseURL}/users`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/channels`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/channels`, async () => {
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
  }),
  http.get(`${baseURL}/users/:userId/tags`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.post(`${baseURL}/users/:userId/tags`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/users/:userId/tags/:tagId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/users/:userId/tags/:tagId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/tags/:tagId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/users/me/tags`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/users/me/tags`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/tags/:tagId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/users/me/tags/:tagId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/stars`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/users/me/stars`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/stars/:channelId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/unread`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/version`, () =>
    responseUnsupportedYet(getGetServerVersion200Response())
  ),
  http.post(`${baseURL}/login`, () => responseUnsupported()),
  http.post(`${baseURL}/logout`, () => responseUnsupported()),
  http.get(`${baseURL}/users/me/sessions`, () =>
    responseUnsupportedYet(undefined)
  ),
  http.delete(`${baseURL}/users/me/sessions/:sessionId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/activity/timeline`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/ws`, () =>
    HttpResponse.json(undefined, { status: 101 })
  ),
  http.get(`${baseURL}/users/me/tokens`, () => responseUnsupportedYet([])),
  http.delete(`${baseURL}/users/me/tokens/:tokenId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/public/icon/:username`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/clients/:clientId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/clients/:clientId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/clients/:clientId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/clients/:clientId/tokens`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/clients`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/clients`, () => responseUnsupportedYet(undefined, 403)),
  http.post(`${baseURL}/bots`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/bots`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/bots/ws`, () =>
    HttpResponse.json(undefined, { status: 101 })
  ),
  http.get(`${baseURL}/bots/:botId/icon`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/bots/:botId/icon`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/bots/:botId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/bots/:botId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/bots/:botId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/activate`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/inactivate`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/reissue`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/bots/:botId/logs`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/bots/:botId/actions/join`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/leave`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/channels/:channelId/bots`, () =>
    responseUnsupportedYet([])
  ),
  http.post(`${baseURL}/webrtc/authenticate`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/channels/:channelId`, async ({ params }) => {
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
  }),
  http.patch(`${baseURL}/channels/:channelId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/webrtc/state`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/clip-folders`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/clip-folders`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/clip-folders/:folderId/messages`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/clip-folders/:folderId/messages`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/clip-folders/:folderId/messages/:messageId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks/:webhookId/messages`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/events`, () =>
    responseUnsupportedYet([])
  ),
  http.get(`${baseURL}/stamp-palettes`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/stamp-palettes`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.delete(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.patch(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/activity/onlines`, () => responseUnsupportedYet([])),
  http.get(`${baseURL}/stamps/:stampId/image`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.put(`${baseURL}/stamps/:stampId/image`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/unread/:channelId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.delete(`${baseURL}/groups/:groupId/admins/:userId`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/groups/:groupId/admins`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId/admins`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.post(`${baseURL}/oauth2/token`, () => responseUnsupported()),
  http.post(`${baseURL}/oauth2/authorize/decide`, () => responseUnsupported()),
  http.get(`${baseURL}/oauth2/authorize`, () => responseUnsupported()),
  http.post(`${baseURL}/oauth2/authorize`, () => responseUnsupported()),
  http.post(`${baseURL}/oauth2/revoke`, () => responseUnsupported()),
  http.get(`${baseURL}/users/me/ex-accounts`, () => responseUnsupportedYet([])),
  http.post(`${baseURL}/users/me/ex-accounts/link`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.post(`${baseURL}/users/me/ex-accounts/unlink`, () =>
    responseUnsupportedYet(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/dm-channel`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/messages/:messageId/clips`, () =>
    responseUnsupportedYet([])
  ),
  http.get(`${baseURL}/ogp`, () => responseUnsupportedYet(undefined, 404)),
  http.delete(`${baseURL}/ogp/cache`, () =>
    responseUnsupportedYet(undefined, 404)
  ),
  http.get(`${baseURL}/users/me/settings`, () =>
    responseUnsupportedYet(getGetUserSettings200Response())
  ),
  http.get(`${baseURL}/users/me/settings/notify-citation`, () =>
    responseUnsupportedYet(getGetMyNotifyCitation200Response())
  ),
  http.put(`${baseURL}/users/me/settings/notify-citation`, () =>
    responseUnsupportedYet(undefined, 403)
  )
]

function getGetChannelStats200Response() {
  return {
    totalMessageCount: faker.number.int(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      count: faker.number.int(),
      total: faker.number.int()
    })),
    users: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      messageCount: faker.number.int()
    })),
    datetime: faker.date.past()
  }
}

function getGetChannelTopic200Response() {
  return {
    topic: faker.lorem.words()
  }
}

function getGetServerVersion200Response() {
  return {
    revision: faker.lorem.words(),
    version: faker.lorem.words(),
    flags: {
      externalLogin: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.lorem.words()),
      signUpAllowed: faker.datatype.boolean()
    }
  }
}

function getGetUserSettings200Response() {
  return {
    id: faker.string.uuid(),
    notifyCitation: faker.datatype.boolean()
  }
}

function getGetMyNotifyCitation200Response() {
  return {
    notifyCitation: faker.datatype.boolean()
  }
}
