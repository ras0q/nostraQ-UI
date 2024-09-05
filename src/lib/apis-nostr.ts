import type { Apis, Channel, Message } from '@traptitech/traq'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AxiosHeaders } from 'axios'
import { kinds, Relay } from 'nostr-tools'
import type { ChannelMetadata } from 'nostr-tools/nip28'

export const overrideApisToNostr = async (apis: Apis): Promise<Apis> => {
  apis.getMessages = async (
    channelId: string,
    limit?: number,
    offset?: number,
    since?: string,
    until?: string,
    inclusive?: boolean,
    order?: 'asc' | 'desc',
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<Message[], unknown>> => {
    const relays = await window.nostr?.getRelays()
    if (relays === undefined) throw new Error('undefined relays')

    const messages: Message[] = []
    for (const [relayURL, { read }] of Object.entries(relays)) {
      if (!read) continue

      const relay = await Relay.connect(relayURL)

      const relayMessages = await new Promise<Message[]>((resolve, reject) => {
        const messages: Message[] = []
        const sub = relay.subscribe(
          [
            {
              kinds: [
                kinds.ChannelMessage,
                kinds.ChannelHideMessage,
                kinds.ChannelMuteUser
              ],
              limit,
              since: since ? isoToUnixtime(since) : undefined,
              until: until ? isoToUnixtime(until) : undefined
            }
          ],
          {
            onevent(e) {
              try {
                switch (e.kind) {
                  case kinds.ChannelMessage: {
                    // TODO: support reply
                    // https://github.com/nostr-protocol/nips/blob/master/28.md#:~:text=Reply%20to%20another%20message%3A
                    const tag = e.tags.at(0)
                    if (tag === undefined) throw new Error('tag not found')

                    const [tagType, channelCreateEventId] = tag
                    if (tagType !== 'e') throw new Error('invalid tag type')
                    // if (channelCreateEventId !== channelId)
                    //   throw new Error('invalid channelId')

                    messages.push({
                      id: e.id,
                      userId: e.pubkey,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      channelId: channelCreateEventId!,
                      content: e.content,
                      createdAt: unixtimeToISO(e.created_at),
                      updatedAt: unixtimeToISO(e.created_at),
                      pinned: false,
                      stamps: [],
                      threadId: null
                    })

                    break
                  }
                }
              } catch (e) {
                reject(e)
              }
            },
            oneose() {
              sub.close() // 追加のストリーミングを受け取らない
              resolve(messages)
            }
          }
        )
      })

      messages.push(...relayMessages)
    }

    return pseudoResponse(
      order === 'asc' ? messages : messages.reverse(),
      200,
      'OK'
    )
  }

  const getChannel = async (
    channelId: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<Channel, unknown>> => {
    const relays = await window.nostr?.getRelays()
    if (relays === undefined) throw new Error('undefined relays')

    let channel: Channel | undefined = undefined
    for (const [relayURL, { read }] of Object.entries(relays)) {
      if (!read) continue

      const relay = await Relay.connect(relayURL)

      const sub = relay.subscribe(
        [
          {
            ids: [channelId],
            kinds: [kinds.ChannelCreation]
          },
          {
            kinds: [kinds.ChannelMetadata],
            '#e': [channelId]
          }
        ],
        {
          onevent(e) {
            switch (e.kind) {
              case kinds.ChannelCreation: {
                if (e.id !== channelId) throw new Error('invalid channelId')

                const meta = JSON.parse(e.content) as ChannelMetadata
                channel = {
                  id: e.id,
                  parentId: null,
                  archived: false,
                  force: false,
                  topic: meta.about,
                  name: meta.name,
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
                if (relayURL !== relay.url) throw new Error('invalid relay')
                if (marker !== 'root' && marker !== 'reply')
                  throw new Error('invalid marker')

                const meta = JSON.parse(e.content) as ChannelMetadata
                if (channel === undefined) throw new Error('undefined channel')

                channel.topic = meta.about
                channel.name = meta.name

                break
              }
            }
          },
          oneose() {
            sub.close() // 追加のストリーミングを受け取らない
          }
        }
      )

      while (!sub.eosed) await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (channel === undefined) throw new Error('undefined channel')

    return pseudoResponse(channel, 200, 'OK')
  }

  return apis
}

const isoToUnixtime = (iso: string): number => new Date(iso).getTime() / 1000
const unixtimeToISO = (unixtime: number): string =>
  new Date(unixtime * 1000).toISOString()

const pseudoResponse = <T>(data: T, status: number, statusText: string) => {
  return {
    data,
    status,
    statusText,
    headers: {
      'x-traq-more': 'true' // メッセージの追加取得のためにとりあえず固定で置いている
    },
    config: {
      headers: new AxiosHeaders()
    }
  }
}
