import { faker } from '@faker-js/faker'
import type { ChannelViewState } from '@traptitech/traq'
import { HttpResponse, http, ws } from 'msw'
import { WEBSOCKET_ENDPOINT } from '/@/lib/apis'
import type { WebSocketCommand } from '/@/lib/websocket'
import type { WebSocketEvent } from '/@/lib/websocket/events'

const path = '${baseURL}/ws'

const getResolver = () => HttpResponse.json(undefined, { status: 101 })

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

const wsResolver = wsConn.addEventListener('connection', ({ client }) => {
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
})

const handlers = [http.get(path, getResolver), wsResolver]

export default handlers
