// generated with following command
// $ npx msw-auto-mock https://raw.githubusercontent.com/traPtitech/traQ/master/docs/v3-api.yaml -o ./src/nostr-mocks

import { HttpResponse, bypass, http, type JsonBodyType } from 'msw'
import { faker } from '@faker-js/faker'
import { BASE_PATH } from '/@/lib/apis'
import {
  UserAccountState,
  type MyUserDetail,
  type UserDetail,
  UserPermission,
  type Message,
  type Channel,
  type ChannelList
} from '@traptitech/traq'
import { SimplePool } from 'nostr-tools/pool'
import { kinds, nip19 } from 'nostr-tools'
import Nostr, { isoToUnixtime, querySync, unixtimeToISO } from './nostr'
import type { ChannelMetadata } from 'nostr-tools/nip28'

faker.seed(1)

const baseURL = BASE_PATH
const MAX_ARRAY_LENGTH = 20

const responseUnsupported = (body?: JsonBodyType, status: number = 200) =>
  HttpResponse.json(body, { status, statusText: 'Unsupported yet' })

// NOTE: 現状getMeはnostrから、loginはtraQから行っているためここで簡易的に管理
let isLogined = false

export const handlers = [
  http.post(`${baseURL}/channels/:channelId/messages`, () =>
    responseUnsupported(undefined, 403)
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
          l.updatedAt < r.updatedAt ? 1 : l.updatedAt === r.updatedAt ? 0 : -1
        )

      return HttpResponse.json(
        order === 'asc' ? messages : messages.reverse(),
        { status: 200 }
      )
    }
  ),
  http.get(`${baseURL}/messages`, () => responseUnsupported([])),
  http.get(`${baseURL}/messages/:messageId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/messages/:messageId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/messages/:messageId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.post(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/messages/:messageId/pin`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/stats`, () =>
    responseUnsupported(getGetChannelStats200Response())
  ),
  http.get(`${baseURL}/channels/:channelId/topic`, () =>
    responseUnsupported(getGetChannelTopic200Response())
  ),
  http.put(`${baseURL}/channels/:channelId/topic`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/channels/:channelId/viewers`, () =>
    responseUnsupported([])
  ),
  http.post(`${baseURL}/files`, () => responseUnsupported(undefined, 403)),
  http.get(`${baseURL}/files`, () => responseUnsupported([])),
  http.get(`${baseURL}/files/:fileId/meta`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/files/:fileId/thumbnail`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/files/:fileId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/files/:fileId`, () =>
    responseUnsupported(undefined, 403)
  ),
  // TODO: https://github.com/nostr-protocol/nips/blob/master/51.md
  http.get(`${baseURL}/channels/:channelId/pins`, () =>
    responseUnsupported([])
  ),
  http.get(`${baseURL}/messages/:messageId/stamps`, () =>
    responseUnsupported([])
  ),
  http.post(`${baseURL}/messages/:messageId/stamps/:stampId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/messages/:messageId/stamps/:stampId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/stamps/:stampId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/stamps`, () => responseUnsupported(undefined, 403)),
  http.get(`${baseURL}/stamps`, () => responseUnsupported([])),
  http.get(`${baseURL}/users/me/stamp-history`, () => responseUnsupported([])),
  http.get(`${baseURL}/users/me/qr-code`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/stamps/:stampId/stats`, () =>
    responseUnsupported(undefined, 404)
  ),
  // NOTE: /users/:userId より優先するために前に置いている
  http.get(`${baseURL}/users/me`, async ({ request }) => {
    if (!isLogined) {
      const response = await fetch(bypass(request))
      if (response.status !== 200)
        return HttpResponse.json(undefined, {
          status: 401,
          statusText: 'Please login on traQ first!'
        })

      isLogined = true
    }

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
  http.patch(`${baseURL}/users/me`, () => responseUnsupported(undefined, 403)),
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
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/groups/:groupId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/groups/:groupId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.put(`${baseURL}/groups/:groupId/icon`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId/members`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.post(`${baseURL}/groups/:groupId/members`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/groups/:groupId/members/:userId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/groups/:groupId/members/:userId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/groups`, () => responseUnsupported([])),
  http.post(`${baseURL}/groups`, () => responseUnsupported([], 403)),
  http.get(`${baseURL}/users/me/oidc`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/users/:userId/messages`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/messages`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/users/:userId/stats`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupported([])
  ),
  http.patch(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.put(`${baseURL}/channels/:channelId/subscribers`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/subscriptions`, () => responseUnsupported([])),
  http.put(`${baseURL}/users/me/subscriptions/:channelId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks`, () => responseUnsupported([])),
  http.post(`${baseURL}/webhooks`, () => responseUnsupported(undefined, 403)),
  http.get(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.post(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/webhooks/:webhookId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks/:webhookId/icon`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/webhooks/:webhookId/icon`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/icon`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/users/:userId/icon`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/icon`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/users/me/icon`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.put(`${baseURL}/users/me/password`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.put(`${baseURL}/users/:userId/password`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/users/me/fcm-device`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/view-states`, () => responseUnsupported([])),
  http.post(`${baseURL}/users`, async () => {
    return HttpResponse.json(undefined, {
      status: 403,
      statusText:
        'Cannot create a new account on nostraQ. Please register Nostr key with NIP-07.'
    })
  }),
  http.get(`${baseURL}/users`, () => responseUnsupported([])),
  http.post(`${baseURL}/channels`, () => responseUnsupported(undefined, 403)),
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
    responseUnsupported(undefined, 404)
  ),
  http.post(`${baseURL}/users/:userId/tags`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/users/:userId/tags/:tagId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/users/:userId/tags/:tagId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/tags/:tagId`, () => responseUnsupported(undefined, 404)),
  http.get(`${baseURL}/users/me/tags`, () => responseUnsupported([])),
  http.post(`${baseURL}/users/me/tags`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/tags/:tagId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/users/me/tags/:tagId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/stars`, () => responseUnsupported([])),
  http.post(`${baseURL}/users/me/stars`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/stars/:channelId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/me/unread`, () => responseUnsupported([])),
  http.get(`${baseURL}/version`, () =>
    responseUnsupported(getGetServerVersion200Response())
  ),
  http.post(`${baseURL}/login`, async ({ request }) => {
    const response = await fetch(bypass(request))
    const { status, statusText } = response
    if (status === 204) {
      return HttpResponse.json(undefined, {
        status,
        headers: {
          'Set-Cookie': response.headers.get('Cookie') ?? ''
        }
      })
    } else if (status === 302) {
      const { searchParams } = new URL(request.url)
      const redirect = searchParams.get('redirect')
      if (redirect) {
        return HttpResponse.redirect(redirect, status)
      }
    }

    return HttpResponse.json(await response.json(), { status, statusText })
  }),
  // http.post(`${baseURL}/logout`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 302 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/sessions`, async () => {
  //   const resultArray = [[await getGetMySessions200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/me/sessions/:sessionId`, async () => {
  //   const resultArray = [[undefined, { status: 204 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  http.get(`${baseURL}/activity/timeline`, () => responseUnsupported([])),
  // http.get(`${baseURL}/ws`, async () => {
  //   const resultArray = [[undefined, { status: 101 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  http.get(`${baseURL}/users/me/tokens`, () => responseUnsupported([])),
  http.delete(`${baseURL}/users/me/tokens/:tokenId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/public/icon/:username`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/clients/:clientId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/clients/:clientId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/clients/:clientId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/clients/:clientId/tokens`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/clients`, () => responseUnsupported([])),
  http.post(`${baseURL}/clients`, () => responseUnsupported(undefined, 403)),
  http.post(`${baseURL}/bots`, () => responseUnsupported([])),
  http.get(`${baseURL}/bots`, () => responseUnsupported([])),
  // http.get(`${baseURL}/bots/ws`, async () => {
  //   const resultArray = [[undefined, { status: 101 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  http.get(`${baseURL}/bots/:botId/icon`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/bots/:botId/icon`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/bots/:botId`, () => responseUnsupported(undefined, 404)),
  http.delete(`${baseURL}/bots/:botId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/bots/:botId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/activate`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/inactivate`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/reissue`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/bots/:botId/logs`, () => responseUnsupported([])),
  http.post(`${baseURL}/bots/:botId/actions/join`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/bots/:botId/actions/leave`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/channels/:channelId/bots`, () =>
    responseUnsupported([])
  ),
  http.post(`${baseURL}/webrtc/authenticate`, () =>
    responseUnsupported(undefined, 403)
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
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/webrtc/state`, () => responseUnsupported([])),
  http.post(`${baseURL}/clip-folders`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/clip-folders`, () => responseUnsupported([])),
  http.get(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/clip-folders/:folderId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/clip-folders/:folderId/messages`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/clip-folders/:folderId/messages`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/clip-folders/:folderId/messages/:messageId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/webhooks/:webhookId/messages`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/channels/:channelId/events`, () =>
    responseUnsupported([])
  ),
  http.get(`${baseURL}/stamp-palettes`, () => responseUnsupported([])),
  http.post(`${baseURL}/stamp-palettes`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.delete(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.patch(`${baseURL}/stamp-palettes/:paletteId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/activity/onlines`, () => responseUnsupported([])),
  http.get(`${baseURL}/stamps/:stampId/image`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.put(`${baseURL}/stamps/:stampId/image`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/users/me/unread/:channelId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.delete(`${baseURL}/groups/:groupId/admins/:userId`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/groups/:groupId/admins`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/groups/:groupId/admins`, () =>
    responseUnsupported(undefined, 404)
  ),
  // http.post(`${baseURL}/oauth2/token`, async () => {}),
  // http.post(`${baseURL}/oauth2/authorize/decide`, async () => {}),
  // http.get(`${baseURL}/oauth2/authorize`, async () => {}),
  // http.post(`${baseURL}/oauth2/authorize`, async () => {}),
  // http.post(`${baseURL}/oauth2/revoke`, async () => {}),
  http.get(`${baseURL}/users/me/ex-accounts`, () => responseUnsupported([])),
  http.post(`${baseURL}/users/me/ex-accounts/link`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.post(`${baseURL}/users/me/ex-accounts/unlink`, () =>
    responseUnsupported(undefined, 403)
  ),
  http.get(`${baseURL}/users/:userId/dm-channel`, () =>
    responseUnsupported(undefined, 404)
  ),
  http.get(`${baseURL}/messages/:messageId/clips`, () =>
    responseUnsupported([])
  ),
  // http.get(`${baseURL}/ogp`, async () => {
  //   const resultArray = [
  //     [await getGetOgp200Response(), { status: 200 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/ogp/cache`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  http.get(`${baseURL}/users/me/settings`, () =>
    responseUnsupported(getGetUserSettings200Response())
  ),
  http.get(`${baseURL}/users/me/settings/notify-citation`, () =>
    responseUnsupported(getGetMyNotifyCitation200Response())
  ),
  http.put(`${baseURL}/users/me/settings/notify-citation`, () =>
    responseUnsupported(undefined, 403)
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
