// generated with following command
// $ npx msw-auto-mock https://raw.githubusercontent.com/traPtitech/traQ/master/docs/v3-api.yaml -o ./src/nostr-mocks

import { HttpResponse, bypass, http } from 'msw'
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

let i = 0
const next = () => {
  if (i === Number.MAX_SAFE_INTEGER - 1) {
    i = 0
  }
  return i++
}

// NOTE: 現状getMeはnostrから、loginはtraQから行っているためここで簡易的に管理
let isLogined = false

export const handlers = [
  // http.post(`${baseURL}/channels/:channelId/messages`, async () => {
  //   const resultArray = [
  //     [await getPostMessage201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  // http.get(`${baseURL}/messages`, async () => {
  //   const resultArray = [
  //     [await getSearchMessages200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 503 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/messages/:messageId`, async () => {
  //   const resultArray = [
  //     [await getGetMessage200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/messages/:messageId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/messages/:messageId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/messages/:messageId/pin`, async () => {
  //   const resultArray = [
  //     [await getGetPin200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/messages/:messageId/pin`, async () => {
  //   const resultArray = [
  //     [await getCreatePin201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/messages/:messageId/pin`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/stats`, async () => {
  //   const resultArray = [
  //     [await getGetChannelStats200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/topic`, async () => {
  //   const resultArray = [
  //     [await getGetChannelTopic200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/channels/:channelId/topic`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/viewers`, async () => {
  //   const resultArray = [
  //     [await getGetChannelViewers200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/files`, async () => {
  //   const resultArray = [
  //     [await getPostFile201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 411 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/files`, async () => {
  //   const resultArray = [
  //     [await getGetFiles200Response(), { status: 200 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/files/:fileId/meta`, async () => {
  //   const resultArray = [
  //     [await getGetFileMeta200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/files/:fileId/thumbnail`, async () => {
  //   const resultArray = [
  //     [await getGetThumbnailImage200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/files/:fileId`, async () => {
  //   const resultArray = [
  //     [await getGetFile200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/files/:fileId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // TODO: support pins
  // https://github.com/nostr-protocol/nips/blob/master/51.md
  http.get(`${baseURL}/channels/:channelId/pins`, async () => {
    return HttpResponse.json([], { status: 200 })
  }),
  // http.get(`${baseURL}/messages/:messageId/stamps`, async () => {
  //   const resultArray = [
  //     [await getGetMessageStamps200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/messages/:messageId/stamps/:stampId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/messages/:messageId/stamps/:stampId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamps/:stampId`, async () => {
  //   const resultArray = [
  //     [await getGetStamp200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/stamps/:stampId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/stamps/:stampId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/stamps`, async () => {
  //   const resultArray = [
  //     [await getCreateStamp201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 409 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamps`, async () => {
  //   const resultArray = [[await getGetStamps200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/stamp-history`, async () => {
  //   const resultArray = [
  //     [await getGetMyStampHistory200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/qr-code`, async () => {
  //   const resultArray = [[await getGetMyQrCode200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamps/:stampId/stats`, async () => {
  //   const resultArray = [
  //     [await getGetStampStats200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  // http.patch(`${baseURL}/users/me`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  // http.patch(`${baseURL}/users/:userId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/groups/:groupId`, async () => {
  //   const resultArray = [
  //     [await getGetUserGroup200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/groups/:groupId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/groups/:groupId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/groups/:groupId/icon`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/groups/:groupId/members`, async () => {
  //   const resultArray = [
  //     [await getGetUserGroupMembers200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/groups/:groupId/members`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/groups/:groupId/members/:userId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/groups/:groupId/members/:userId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/groups`, async () => {
  //   const resultArray = [[await getGetUserGroups200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/groups`, async () => {
  //   const resultArray = [
  //     [await getCreateUserGroup201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/oidc`, async () => {
  //   const resultArray = [
  //     [await getGetOidcUserInfo200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/:userId/messages`, async () => {
  //   const resultArray = [
  //     [await getPostDirectMessage201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/:userId/messages`, async () => {
  //   const resultArray = [
  //     [await getGetDirectMessages200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/:userId/stats`, async () => {
  //   const resultArray = [
  //     [await getGetUserStats200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/subscribers`, async () => {
  //   const resultArray = [
  //     [await getGetChannelSubscribers200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/channels/:channelId/subscribers`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/channels/:channelId/subscribers`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/subscriptions`, async () => {
  //   const resultArray = [
  //     [await getGetMyChannelSubscriptions200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/me/subscriptions/:channelId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/webhooks`, async () => {
  //   const resultArray = [[await getGetWebhooks200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/webhooks`, async () => {
  //   const resultArray = [
  //     [await getCreateWebhook201Response(), { status: 201 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/webhooks/:webhookId`, async () => {
  //   const resultArray = [
  //     [await getGetWebhook200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/webhooks/:webhookId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/webhooks/:webhookId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/webhooks/:webhookId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/webhooks/:webhookId/icon`, async () => {
  //   const resultArray = [
  //     [await getGetWebhookIcon200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/webhooks/:webhookId/icon`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/:userId/icon`, async () => {
  //   const resultArray = [
  //     [await getGetUserIcon200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/:userId/icon`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/icon`, async () => {
  //   const resultArray = [
  //     [await getGetMyIcon200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/me/icon`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/me/password`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 401 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/:userId/password`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/me/fcm-device`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/view-states`, async () => {
  //   const resultArray = [
  //     [await getGetMyViewStates200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users`, async () => {
  //   const resultArray = [
  //     [await getCreateUser201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users`, async () => {
  //   const resultArray = [
  //     [await getGetUsers200Response(), { status: 200 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/channels`, async () => {
  //   const resultArray = [
  //     [await getCreateChannel201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  // http.get(`${baseURL}/users/:userId/tags`, async () => {
  //   const resultArray = [
  //     [await getGetUserTags200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/:userId/tags`, async () => {
  //   const resultArray = [
  //     [await getAddUserTag201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/users/:userId/tags/:tagId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/:userId/tags/:tagId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/tags/:tagId`, async () => {
  //   const resultArray = [
  //     [await getGetTag200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/tags`, async () => {
  //   const resultArray = [[await getGetMyUserTags200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/me/tags`, async () => {
  //   const resultArray = [
  //     [await getAddMyUserTag201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/me/tags/:tagId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/users/me/tags/:tagId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/stars`, async () => {
  //   const resultArray = [[await getGetMyStars200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/me/stars`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/me/stars/:channelId`, async () => {
  //   const resultArray = [[undefined, { status: 204 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/unread`, async () => {
  //   const resultArray = [
  //     [await getGetMyUnreadChannels200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/version`, async () => {
  //   const resultArray = [
  //     [await getGetServerVersion200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/login`, async ({ request }) => {}),
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
  // http.get(`${baseURL}/activity/timeline`, async () => {
  //   const resultArray = [
  //     [await getGetActivityTimeline200Response(), { status: 200 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/ws`, async () => {
  //   const resultArray = [[undefined, { status: 101 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/tokens`, async () => {
  //   const resultArray = [[await getGetMyTokens200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/me/tokens/:tokenId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/public/icon/:username`, async () => {
  //   const resultArray = [
  //     [await getGetPublicUserIcon200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/clients/:clientId`, async () => {
  //   const resultArray = [
  //     [await getGetClient200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/clients/:clientId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/clients/:clientId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/clients/:clientId/tokens`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/clients`, async () => {
  //   const resultArray = [[await getGetClients200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/clients`, async () => {
  //   const resultArray = [
  //     [await getCreateClient201Response(), { status: 201 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots`, async () => {
  //   const resultArray = [
  //     [await getCreateBot201Response(), { status: 201 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/bots`, async () => {
  //   const resultArray = [[await getGetBots200Response(), { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/bots/ws`, async () => {
  //   const resultArray = [[undefined, { status: 101 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/bots/:botId/icon`, async () => {
  //   const resultArray = [
  //     [await getGetBotIcon200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/bots/:botId/icon`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/bots/:botId`, async () => {
  //   const resultArray = [
  //     [await getGetBot200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/bots/:botId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/bots/:botId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots/:botId/actions/activate`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 202 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots/:botId/actions/inactivate`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots/:botId/actions/reissue`, async () => {
  //   const resultArray = [
  //     [await getReissueBot200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/bots/:botId/logs`, async () => {
  //   const resultArray = [
  //     [await getGetBotLogs200Response(), { status: 200 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots/:botId/actions/join`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/bots/:botId/actions/leave`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/bots`, async () => {
  //   const resultArray = [
  //     [await getGetChannelBots200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/webrtc/authenticate`, async () => {
  //   const resultArray = [
  //     [await getPostWebRtcAuthenticate200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 503 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  })
  // http.patch(`${baseURL}/channels/:channelId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/webrtc/state`, async () => {
  //   const resultArray = [
  //     [await getGetWebRtcState200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/clip-folders`, async () => {
  //   const resultArray = [
  //     [await getCreateClipFolder201Response(), { status: 201 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/clip-folders`, async () => {
  //   const resultArray = [
  //     [await getGetClipFolders200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/clip-folders/:folderId`, async () => {
  //   const resultArray = [
  //     [await getGetClipFolder200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/clip-folders/:folderId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/clip-folders/:folderId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/clip-folders/:folderId/messages`, async () => {
  //   const resultArray = [
  //     [await getClipMessage200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 409 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/clip-folders/:folderId/messages`, async () => {
  //   const resultArray = [
  //     [await getGetClips200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(
  //   `${baseURL}/clip-folders/:folderId/messages/:messageId`,
  //   async () => {
  //     const resultArray = [
  //       [undefined, { status: 204 }],
  //       [undefined, { status: 404 }]
  //     ]

  //     return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  //   }
  // ),
  // http.get(`${baseURL}/webhooks/:webhookId/messages`, async () => {
  //   const resultArray = [
  //     [await getGetWebhookMessages200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/channels/:channelId/events`, async () => {
  //   const resultArray = [
  //     [await getGetChannelEvents200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamp-palettes`, async () => {
  //   const resultArray = [
  //     [await getGetStampPalettes200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/stamp-palettes`, async () => {
  //   const resultArray = [
  //     [await getCreateStampPalette201Response(), { status: 201 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamp-palettes/:paletteId`, async () => {
  //   const resultArray = [
  //     [await getGetStampPalette200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/stamp-palettes/:paletteId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.patch(`${baseURL}/stamp-palettes/:paletteId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/activity/onlines`, async () => {
  //   const resultArray = [
  //     [await getGetOnlineUsers200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/stamps/:stampId/image`, async () => {
  //   const resultArray = [
  //     [await getGetStampImage200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/stamps/:stampId/image`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 404 }],
  //     [undefined, { status: 413 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/users/me/unread/:channelId`, async () => {
  //   const resultArray = [[undefined, { status: 204 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.delete(`${baseURL}/groups/:groupId/admins/:userId`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/groups/:groupId/admins`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/groups/:groupId/admins`, async () => {
  //   const resultArray = [
  //     [await getGetUserGroupAdmins200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/oauth2/token`, async () => {
  //   const resultArray = [
  //     [await getPostOAuth2Token200Response(), { status: 200 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/oauth2/authorize/decide`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 302 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/oauth2/authorize`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 302 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/oauth2/authorize`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 302 }],
  //     [undefined, { status: 400 }],
  //     [undefined, { status: 403 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/oauth2/revoke`, async () => {
  //   const resultArray = [[undefined, { status: 200 }]]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/ex-accounts`, async () => {
  //   const resultArray = [
  //     [await getGetMyExternalAccounts200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/me/ex-accounts/link`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 302 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.post(`${baseURL}/users/me/ex-accounts/unlink`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/:userId/dm-channel`, async () => {
  //   const resultArray = [
  //     [await getGetUserDmChannel200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/messages/:messageId/clips`, async () => {
  //   const resultArray = [
  //     [await getGetMessageClips200Response(), { status: 200 }],
  //     [undefined, { status: 404 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
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
  // http.get(`${baseURL}/users/me/settings`, async () => {
  //   const resultArray = [
  //     [await getGetUserSettings200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.get(`${baseURL}/users/me/settings/notify-citation`, async () => {
  //   const resultArray = [
  //     [await getGetMyNotifyCitation200Response(), { status: 200 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // }),
  // http.put(`${baseURL}/users/me/settings/notify-citation`, async () => {
  //   const resultArray = [
  //     [undefined, { status: 204 }],
  //     [undefined, { status: 400 }]
  //   ]

  //   return HttpResponse.json(...resultArray[next() % resultArray.length]!)
  // })
]

export function getPostMessage201Response() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }
}

export function getGetMessages200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }))
}

export function getSearchMessages200Response() {
  return {
    totalHits: faker.number.int(),
    hits: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      channelId: faker.string.uuid(),
      content: faker.lorem.words(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      pinned: faker.datatype.boolean(),
      stamps: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => ({
        userId: faker.string.uuid(),
        stampId: faker.string.uuid(),
        count: faker.number.int(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
      })),
      threadId: faker.string.uuid()
    }))
  }
}

export function getGetMessage200Response() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }
}

export function getGetPin200Response() {
  return {
    userId: faker.string.uuid(),
    pinnedAt: faker.date.past()
  }
}

export function getCreatePin201Response() {
  return {
    userId: faker.string.uuid(),
    pinnedAt: faker.date.past()
  }
}

export function getGetChannelStats200Response() {
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

export function getGetChannelTopic200Response() {
  return {
    topic: faker.lorem.words()
  }
}

export function getGetChannelViewers200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    userId: faker.string.uuid(),
    state: faker.helpers.arrayElement(['none', 'monitoring', 'editing']),
    updatedAt: faker.date.past()
  }))
}

export function getPostFile201Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    mime: faker.lorem.words(),
    size: faker.number.int(),
    md5: faker.lorem.words(),
    isAnimatedImage: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    thumbnails: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      type: faker.helpers.arrayElement(['image', 'waveform']),
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    })),
    thumbnail: {
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    },
    channelId: faker.string.uuid(),
    uploaderId: faker.string.uuid()
  }
}

export function getGetFiles200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    mime: faker.lorem.words(),
    size: faker.number.int(),
    md5: faker.lorem.words(),
    isAnimatedImage: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    thumbnails: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      type: faker.helpers.arrayElement(['image', 'waveform']),
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    })),
    thumbnail: {
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    },
    channelId: faker.string.uuid(),
    uploaderId: faker.string.uuid()
  }))
}

export function getGetFileMeta200Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    mime: faker.lorem.words(),
    size: faker.number.int(),
    md5: faker.lorem.words(),
    isAnimatedImage: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    thumbnails: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      type: faker.helpers.arrayElement(['image', 'waveform']),
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    })),
    thumbnail: {
      mime: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    },
    channelId: faker.string.uuid(),
    uploaderId: faker.string.uuid()
  }
}

export function getGetThumbnailImage200Response() {
  return null
}

export function getGetFile200Response() {
  return null
}

export function getGetChannelPins200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    userId: faker.string.uuid(),
    pinnedAt: faker.date.past(),
    message: {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      channelId: faker.string.uuid(),
      content: faker.lorem.words(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      pinned: faker.datatype.boolean(),
      stamps: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => ({
        userId: faker.string.uuid(),
        stampId: faker.string.uuid(),
        count: faker.number.int(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
      })),
      threadId: faker.string.uuid()
    }
  }))
}

export function getGetMessageStamps200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    userId: faker.string.uuid(),
    stampId: faker.string.uuid(),
    count: faker.number.int(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getGetStamp200Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    fileId: faker.string.uuid(),
    isUnicode: faker.datatype.boolean()
  }
}

export function getCreateStamp201Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    fileId: faker.string.uuid(),
    isUnicode: faker.datatype.boolean()
  }
}

export function getGetStamps200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    fileId: faker.string.uuid(),
    isUnicode: faker.datatype.boolean(),
    hasThumbnail: faker.datatype.boolean()
  }))
}

export function getGetMyStampHistory200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    stampId: faker.string.uuid(),
    datetime: faker.date.past()
  }))
}

export function getGetMyQrCode200Response() {
  return null
}

export function getGetStampStats200Response() {
  return {
    count: faker.number.int(),
    totalCount: faker.number.int()
  }
}

export function getGetUser200Response() {
  return {
    id: faker.string.uuid(),
    state: faker.helpers.arrayElement([0, 1, 2]),
    bot: faker.datatype.boolean(),
    iconFileId: faker.string.uuid(),
    displayName: faker.person.fullName(),
    name: faker.person.fullName(),
    twitterId: faker.lorem.words(),
    lastOnline: faker.date.past(),
    updatedAt: faker.date.past(),
    tags: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      tagId: faker.string.uuid(),
      tag: faker.lorem.words(),
      isLocked: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    groups: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    bio: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    homeChannel: faker.string.uuid()
  }
}

export function getGetUserGroup200Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    description: faker.lorem.words(),
    type: faker.lorem.words(),
    icon: faker.string.uuid(),
    members: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      role: faker.string.alpha({ length: { min: 0, max: 100 } })
    })),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    admins: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetUserGroupMembers200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    role: faker.string.alpha({ length: { min: 0, max: 100 } })
  }))
}

export function getGetUserGroups200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    description: faker.lorem.words(),
    type: faker.lorem.words(),
    icon: faker.string.uuid(),
    members: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      role: faker.string.alpha({ length: { min: 0, max: 100 } })
    })),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    admins: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }))
}

export function getCreateUserGroup201Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    description: faker.lorem.words(),
    type: faker.lorem.words(),
    icon: faker.string.uuid(),
    members: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      role: faker.string.alpha({ length: { min: 0, max: 100 } })
    })),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    admins: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetMe200Response() {
  return {
    id: faker.string.uuid(),
    bio: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    groups: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    tags: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      tagId: faker.string.uuid(),
      tag: faker.lorem.words(),
      isLocked: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    updatedAt: faker.date.past(),
    lastOnline: faker.date.past(),
    twitterId: faker.lorem.words(),
    name: faker.person.fullName(),
    displayName: faker.person.fullName(),
    iconFileId: faker.string.uuid(),
    bot: faker.datatype.boolean(),
    state: faker.helpers.arrayElement([0, 1, 2]),
    permissions: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ =>
      faker.helpers.arrayElement([
        'get_webhook',
        'create_webhook',
        'edit_webhook',
        'delete_webhook',
        'access_others_webhook',
        'get_bot',
        'create_bot',
        'edit_bot',
        'delete_bot',
        'access_others_bot',
        'bot_action_join_channel',
        'bot_action_leave_channel',
        'create_channel',
        'get_channel',
        'edit_channel',
        'delete_channel',
        'change_parent_channel',
        'edit_channel_topic',
        'get_channel_star',
        'edit_channel_star',
        'get_my_tokens',
        'revoke_my_token',
        'get_clients',
        'create_client',
        'edit_my_client',
        'delete_my_client',
        'manage_others_client',
        'upload_file',
        'download_file',
        'delete_file',
        'get_message',
        'post_message',
        'edit_message',
        'delete_message',
        'report_message',
        'get_message_reports',
        'create_message_pin',
        'delete_message_pin',
        'get_channel_subscription',
        'edit_channel_subscription',
        'connect_notification_stream',
        'register_fcm_device',
        'get_stamp',
        'create_stamp',
        'edit_stamp',
        'edit_stamp_created_by_others',
        'delete_stamp',
        'delete_my_stamp',
        'add_message_stamp',
        'remove_message_stamp',
        'get_my_stamp_history',
        'get_stamp_palette',
        'create_stamp_palette',
        'edit_stamp_palette',
        'delete_stamp_palette',
        'get_user',
        'register_user',
        'get_me',
        'get_oidc_userinfo',
        'edit_me',
        'change_my_icon',
        'change_my_password',
        'edit_other_users',
        'get_user_qr_code',
        'get_user_tag',
        'edit_user_tag',
        'get_user_group',
        'create_user_group',
        'create_special_user_group',
        'edit_user_group',
        'delete_user_group',
        'edit_others_user_group',
        'web_rtc',
        'get_my_sessions',
        'delete_my_sessions',
        'get_my_external_account',
        'edit_my_external_account',
        'get_unread',
        'delete_unread',
        'get_clip_folder',
        'create_clip_folder',
        'edit_clip_folder',
        'delete_clip_folder'
      ])
    ),
    homeChannel: faker.string.uuid()
  }
}

export function getGetOidcUserInfo200Response() {
  return {
    sub: faker.string.uuid(),
    name: faker.person.fullName(),
    preferred_username: faker.person.fullName(),
    picture: faker.lorem.words(),
    updated_at: faker.number.int(),
    traq: {
      bio: faker.string.alpha({ length: { min: 0, max: 1000 } }),
      groups: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.string.uuid()),
      tags: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => ({
        tagId: faker.string.uuid(),
        tag: faker.lorem.words(),
        isLocked: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
      })),
      last_online: faker.date.past(),
      twitter_id: faker.lorem.words(),
      display_name: faker.person.fullName(),
      icon_file_id: faker.string.uuid(),
      bot: faker.datatype.boolean(),
      state: faker.helpers.arrayElement([0, 1, 2]),
      permissions: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ =>
        faker.helpers.arrayElement([
          'get_webhook',
          'create_webhook',
          'edit_webhook',
          'delete_webhook',
          'access_others_webhook',
          'get_bot',
          'create_bot',
          'edit_bot',
          'delete_bot',
          'access_others_bot',
          'bot_action_join_channel',
          'bot_action_leave_channel',
          'create_channel',
          'get_channel',
          'edit_channel',
          'delete_channel',
          'change_parent_channel',
          'edit_channel_topic',
          'get_channel_star',
          'edit_channel_star',
          'get_my_tokens',
          'revoke_my_token',
          'get_clients',
          'create_client',
          'edit_my_client',
          'delete_my_client',
          'manage_others_client',
          'upload_file',
          'download_file',
          'delete_file',
          'get_message',
          'post_message',
          'edit_message',
          'delete_message',
          'report_message',
          'get_message_reports',
          'create_message_pin',
          'delete_message_pin',
          'get_channel_subscription',
          'edit_channel_subscription',
          'connect_notification_stream',
          'register_fcm_device',
          'get_stamp',
          'create_stamp',
          'edit_stamp',
          'edit_stamp_created_by_others',
          'delete_stamp',
          'delete_my_stamp',
          'add_message_stamp',
          'remove_message_stamp',
          'get_my_stamp_history',
          'get_stamp_palette',
          'create_stamp_palette',
          'edit_stamp_palette',
          'delete_stamp_palette',
          'get_user',
          'register_user',
          'get_me',
          'get_oidc_userinfo',
          'edit_me',
          'change_my_icon',
          'change_my_password',
          'edit_other_users',
          'get_user_qr_code',
          'get_user_tag',
          'edit_user_tag',
          'get_user_group',
          'create_user_group',
          'create_special_user_group',
          'edit_user_group',
          'delete_user_group',
          'edit_others_user_group',
          'web_rtc',
          'get_my_sessions',
          'delete_my_sessions',
          'get_my_external_account',
          'edit_my_external_account',
          'get_unread',
          'delete_unread',
          'get_clip_folder',
          'create_clip_folder',
          'edit_clip_folder',
          'delete_clip_folder'
        ])
      ),
      home_channel: faker.string.uuid()
    }
  }
}

export function getPostDirectMessage201Response() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }
}

export function getGetDirectMessages200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }))
}

export function getGetUserStats200Response() {
  return {
    totalMessageCount: faker.number.int(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      count: faker.number.int(),
      total: faker.number.int()
    })),
    datetime: faker.date.past()
  }
}

export function getGetChannelSubscribers200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => faker.string.uuid())
}

export function getGetMyChannelSubscriptions200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    channelId: faker.string.uuid(),
    level: faker.helpers.arrayElement([0, 1, 2])
  }))
}

export function getGetWebhooks200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    botUserId: faker.string.uuid(),
    displayName: faker.person.fullName(),
    description: faker.lorem.words(),
    secure: faker.datatype.boolean(),
    channelId: faker.string.uuid(),
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getCreateWebhook201Response() {
  return {
    id: faker.string.uuid(),
    botUserId: faker.string.uuid(),
    displayName: faker.person.fullName(),
    description: faker.lorem.words(),
    secure: faker.datatype.boolean(),
    channelId: faker.string.uuid(),
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }
}

export function getGetWebhook200Response() {
  return {
    id: faker.string.uuid(),
    botUserId: faker.string.uuid(),
    displayName: faker.person.fullName(),
    description: faker.lorem.words(),
    secure: faker.datatype.boolean(),
    channelId: faker.string.uuid(),
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }
}

export function getGetWebhookIcon200Response() {
  return null
}

export function getGetUserIcon200Response() {
  return null
}

export function getGetMyIcon200Response() {
  return null
}

export function getGetMyViewStates200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    key: faker.lorem.words(),
    channelId: faker.string.uuid(),
    state: faker.helpers.arrayElement(['none', 'monitoring', 'editing'])
  }))
}

export function getCreateUser201Response() {
  return {
    id: faker.string.uuid(),
    state: faker.helpers.arrayElement([0, 1, 2]),
    bot: faker.datatype.boolean(),
    iconFileId: faker.string.uuid(),
    displayName: faker.person.fullName(),
    name: faker.person.fullName(),
    twitterId: faker.lorem.words(),
    lastOnline: faker.date.past(),
    updatedAt: faker.date.past(),
    tags: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      tagId: faker.string.uuid(),
      tag: faker.lorem.words(),
      isLocked: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    groups: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    bio: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    homeChannel: faker.string.uuid()
  }
}

export function getGetUsers200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    displayName: faker.person.fullName(),
    iconFileId: faker.string.uuid(),
    bot: faker.datatype.boolean(),
    state: faker.helpers.arrayElement([0, 1, 2]),
    updatedAt: faker.date.past()
  }))
}

export function getCreateChannel201Response() {
  return {
    id: faker.string.uuid(),
    parentId: faker.string.uuid(),
    archived: faker.datatype.boolean(),
    force: faker.datatype.boolean(),
    topic: faker.lorem.words(),
    name: faker.person.fullName(),
    children: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetChannels200Response() {
  return {
    public: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      parentId: faker.string.uuid(),
      archived: faker.datatype.boolean(),
      force: faker.datatype.boolean(),
      topic: faker.lorem.words(),
      name: faker.person.fullName(),
      children: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.string.uuid())
    })),
    dm: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid()
    }))
  }
}

export function getGetUserTags200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    tagId: faker.string.uuid(),
    tag: faker.lorem.words(),
    isLocked: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getAddUserTag201Response() {
  return {
    tagId: faker.string.uuid(),
    tag: faker.lorem.words(),
    isLocked: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }
}

export function getGetTag200Response() {
  return {
    id: faker.string.uuid(),
    tag: faker.string.alpha({ length: { min: 1, max: 30 } }),
    users: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetMyUserTags200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    tagId: faker.string.uuid(),
    tag: faker.lorem.words(),
    isLocked: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getAddMyUserTag201Response() {
  return {
    tagId: faker.string.uuid(),
    tag: faker.lorem.words(),
    isLocked: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }
}

export function getGetMyStars200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => faker.string.uuid())
}

export function getGetMyUnreadChannels200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    channelId: faker.string.uuid(),
    count: faker.number.int(),
    noticeable: faker.datatype.boolean(),
    since: faker.date.past(),
    updatedAt: faker.date.past(),
    oldestMessageId: faker.string.uuid()
  }))
}

export function getGetServerVersion200Response() {
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

export function getGetMySessions200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    issuedAt: faker.date.past()
  }))
}

export function getGetActivityTimeline200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getGetMyTokens200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    clientId: faker.lorem.words(),
    scopes: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ =>
      faker.helpers.arrayElement([
        'openid',
        'profile',
        'read',
        'write',
        'manage_bot'
      ])
    ),
    issuedAt: faker.date.past()
  }))
}

export function getGetPublicUserIcon200Response() {
  return null
}

export function getGetClient200Response() {
  return faker.helpers.arrayElement([
    {
      id: faker.lorem.words(),
      name: faker.person.fullName(),
      description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
      developerId: faker.string.uuid(),
      scopes: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ =>
        faker.helpers.arrayElement([
          'openid',
          'profile',
          'read',
          'write',
          'manage_bot'
        ])
      ),
      confidential: faker.datatype.boolean()
    },
    {
      id: faker.lorem.words(),
      developerId: faker.string.uuid(),
      description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
      name: faker.person.fullName(),
      scopes: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ =>
        faker.helpers.arrayElement([
          'openid',
          'profile',
          'read',
          'write',
          'manage_bot'
        ])
      ),
      callbackUrl: faker.internet.url(),
      secret: faker.lorem.words(),
      confidential: faker.datatype.boolean()
    }
  ])
}

export function getGetClients200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.lorem.words(),
    name: faker.person.fullName(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    developerId: faker.string.uuid(),
    scopes: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ =>
      faker.helpers.arrayElement([
        'openid',
        'profile',
        'read',
        'write',
        'manage_bot'
      ])
    ),
    confidential: faker.datatype.boolean()
  }))
}

export function getCreateClient201Response() {
  return {
    id: faker.lorem.words(),
    developerId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    name: faker.person.fullName(),
    scopes: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ =>
      faker.helpers.arrayElement([
        'openid',
        'profile',
        'read',
        'write',
        'manage_bot'
      ])
    ),
    callbackUrl: faker.internet.url(),
    secret: faker.lorem.words(),
    confidential: faker.datatype.boolean()
  }
}

export function getCreateBot201Response() {
  return {
    id: faker.string.uuid(),
    updatedAt: faker.date.past(),
    createdAt: faker.date.past(),
    mode: faker.helpers.arrayElement(['HTTP', 'WebSocket']),
    state: faker.helpers.arrayElement([0, 1, 2]),
    subscribeEvents: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.lorem.words()),
    developerId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    botUserId: faker.string.uuid(),
    tokens: {
      verificationToken: faker.lorem.words(),
      accessToken: faker.lorem.words()
    },
    endpoint: faker.internet.url(),
    privileged: faker.datatype.boolean(),
    channels: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetBots200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    botUserId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
    developerId: faker.string.uuid(),
    subscribeEvents: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.lorem.words()),
    mode: faker.helpers.arrayElement(['HTTP', 'WebSocket']),
    state: faker.helpers.arrayElement([0, 1, 2]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past()
  }))
}

export function getGetBotIcon200Response() {
  return null
}

export function getGetBot200Response() {
  return faker.helpers.arrayElement([
    {
      id: faker.string.uuid(),
      botUserId: faker.string.uuid(),
      description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
      developerId: faker.string.uuid(),
      subscribeEvents: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.lorem.words()),
      mode: faker.helpers.arrayElement(['HTTP', 'WebSocket']),
      state: faker.helpers.arrayElement([0, 1, 2]),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    },
    {
      id: faker.string.uuid(),
      updatedAt: faker.date.past(),
      createdAt: faker.date.past(),
      mode: faker.helpers.arrayElement(['HTTP', 'WebSocket']),
      state: faker.helpers.arrayElement([0, 1, 2]),
      subscribeEvents: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.lorem.words()),
      developerId: faker.string.uuid(),
      description: faker.string.alpha({ length: { min: 0, max: 1000 } }),
      botUserId: faker.string.uuid(),
      tokens: {
        verificationToken: faker.lorem.words(),
        accessToken: faker.lorem.words()
      },
      endpoint: faker.internet.url(),
      privileged: faker.datatype.boolean(),
      channels: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => faker.string.uuid())
    }
  ])
}

export function getReissueBot200Response() {
  return {
    verificationToken: faker.lorem.words(),
    accessToken: faker.lorem.words()
  }
}

export function getGetBotLogs200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    botId: faker.string.uuid(),
    requestId: faker.string.uuid(),
    event: faker.lorem.words(),
    result: faker.helpers.arrayElement(['ok', 'ng', 'ne', 'dp']),
    code: faker.number.int(),
    datetime: faker.date.past()
  }))
}

export function getGetChannelBots200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    botUserId: faker.string.uuid()
  }))
}

export function getPostWebRtcAuthenticate200Response() {
  return {
    peerId: faker.lorem.words(),
    ttl: faker.number.int(),
    timestamp: faker.number.int(),
    authToken: faker.lorem.words()
  }
}

export function getGetChannel200Response() {
  return {
    id: faker.string.uuid(),
    parentId: faker.string.uuid(),
    archived: faker.datatype.boolean(),
    force: faker.datatype.boolean(),
    topic: faker.lorem.words(),
    name: faker.person.fullName(),
    children: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid())
  }
}

export function getGetWebRtcState200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    sessions: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      state: faker.lorem.words(),
      sessionId: faker.lorem.words()
    }))
  }))
}

export function getCreateClipFolder201Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    createdAt: faker.date.past(),
    ownerId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }
}

export function getGetClipFolders200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    createdAt: faker.date.past(),
    ownerId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }))
}

export function getGetClipFolder200Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    createdAt: faker.date.past(),
    ownerId: faker.string.uuid(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }
}

export function getClipMessage200Response() {
  return {
    message: {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      channelId: faker.string.uuid(),
      content: faker.lorem.words(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      pinned: faker.datatype.boolean(),
      stamps: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => ({
        userId: faker.string.uuid(),
        stampId: faker.string.uuid(),
        count: faker.number.int(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
      })),
      threadId: faker.string.uuid()
    },
    clippedAt: faker.date.past()
  }
}

export function getGetClips200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    message: {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      channelId: faker.string.uuid(),
      content: faker.lorem.words(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      pinned: faker.datatype.boolean(),
      stamps: [
        ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
      ].map(_ => ({
        userId: faker.string.uuid(),
        stampId: faker.string.uuid(),
        count: faker.number.int(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
      })),
      threadId: faker.string.uuid()
    },
    clippedAt: faker.date.past()
  }))
}

export function getGetWebhookMessages200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    channelId: faker.string.uuid(),
    content: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    pinned: faker.datatype.boolean(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      userId: faker.string.uuid(),
      stampId: faker.string.uuid(),
      count: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    })),
    threadId: faker.string.uuid()
  }))
}

export function getGetChannelEvents200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    type: faker.helpers.arrayElement([
      'TopicChanged',
      'SubscribersChanged',
      'PinAdded',
      'PinRemoved',
      'NameChanged',
      'ParentChanged',
      'VisibilityChanged',
      'ForcedNotificationChanged',
      'ChildCreated'
    ]),
    datetime: faker.date.past(),
    detail: faker.helpers.arrayElement([
      {
        userId: faker.string.uuid(),
        before: faker.lorem.words(),
        after: faker.lorem.words()
      },
      {
        userId: faker.string.uuid(),
        on: [
          ...new Array(
            faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })
          ).keys()
        ].map(_ => faker.string.uuid()),
        off: [
          ...new Array(
            faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })
          ).keys()
        ].map(_ => faker.string.uuid())
      },
      {
        userId: faker.string.uuid(),
        messageId: faker.string.uuid()
      },
      {
        userId: faker.string.uuid(),
        messageId: faker.string.uuid()
      },
      {
        userId: faker.string.uuid(),
        before: faker.lorem.words(),
        after: faker.lorem.words()
      },
      {
        userId: faker.string.uuid(),
        before: faker.string.uuid(),
        after: faker.string.uuid()
      },
      {
        userId: faker.string.uuid(),
        visibility: faker.datatype.boolean()
      },
      {
        userId: faker.string.uuid(),
        force: faker.datatype.boolean()
      },
      {
        userId: faker.string.uuid(),
        channelId: faker.string.uuid()
      }
    ])
  }))
}

export function getGetStampPalettes200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }))
}

export function getCreateStampPalette201Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }
}

export function getGetStampPalette200Response() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    stamps: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => faker.string.uuid()),
    creatorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    description: faker.string.alpha({ length: { min: 0, max: 1000 } })
  }
}

export function getGetOnlineUsers200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => faker.lorem.words())
}

export function getGetStampImage200Response() {
  return null
}

export function getGetUserGroupAdmins200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => faker.string.uuid())
}

export function getPostOAuth2Token200Response() {
  return {
    access_token: faker.lorem.words(),
    token_type: faker.lorem.words(),
    expires_in: faker.number.int(),
    refresh_token: faker.lorem.words(),
    scope: faker.lorem.words(),
    id_token: faker.lorem.words()
  }
}

export function getGetMyExternalAccounts200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    providerName: faker.person.fullName(),
    linkedAt: faker.lorem.words(),
    externalName: faker.person.fullName()
  }))
}

export function getGetUserDmChannel200Response() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid()
  }
}

export function getGetMessageClips200Response() {
  return [
    ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
  ].map(_ => ({
    folderId: faker.string.uuid(),
    clippedAt: faker.date.past()
  }))
}

export function getGetOgp200Response() {
  return {
    type: faker.lorem.words(),
    title: faker.lorem.words(),
    url: faker.internet.url(),
    images: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      url: faker.internet.url(),
      secureUrl: faker.internet.url(),
      type: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    })),
    description: faker.lorem.words(),
    videos: [
      ...new Array(faker.number.int({ min: 1, max: MAX_ARRAY_LENGTH })).keys()
    ].map(_ => ({
      url: faker.internet.url(),
      secureUrl: faker.internet.url(),
      type: faker.lorem.words(),
      width: faker.number.int(),
      height: faker.number.int()
    }))
  }
}

export function getGetUserSettings200Response() {
  return {
    id: faker.string.uuid(),
    notifyCitation: faker.datatype.boolean()
  }
}

export function getGetMyNotifyCitation200Response() {
  return {
    notifyCitation: faker.datatype.boolean()
  }
}
