import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from './index'
import api from '@/lib/api'
import { reduceToRecord } from '@/lib/util/record'

// TODO: リクエストパラメータの型置き場
interface GetMessagesParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  options?: any
}

export const entitiesActionContext = (context: any) =>
  moduleActionContext(context, entities)

export const actions = defineActions({
  async fetchUsers(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUsers()
    commit.setUsers(reduceToRecord(res.data, 'id'))
  },
  async fetchChannels(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getChannels(true)
    // TODO: DM対応
    if (res.data.public) {
      commit.setChannels(reduceToRecord(res.data.public, 'id'))
    }
  },
  async fetchUserGroups(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUserGroups()
    commit.setUserGroups(reduceToRecord(res.data, 'id'))
  },
  async fetchStamps(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getStamps()
    commit.setStamps(reduceToRecord(res.data, 'id'))
  },
  async fetchStampPalettes(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getStampPalettes()
    commit.setStampPalettes(reduceToRecord(res.data, 'id'))
  },
  async fetchMessagesByChannelId(
    context,
    { channelId, limit, offset }: GetMessagesParams
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getMessages(channelId, limit, offset)
    commit.extendMessages(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  }
})
