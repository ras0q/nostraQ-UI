import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, toRaw } from 'vue'
import {
  categorizeUnicodeStamps,
  constructStampNameIdMap,
  StampCategory,
  traQStampsToStampCategory
} from '/@/lib/stampCategorizer'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import store from '/@/vuex'
import { entityMitt } from '/@/vuex/entities/mitt'

const useStampCategoryPinia = defineStore('domain/stampCategory', () => {
  const traQStampCategory = ref<Readonly<StampCategory>>({
    name: 'traq',
    stampIds: []
  })
  const unicodeStampCategories = ref<readonly StampCategory[]>([])

  const constructStampCategories = async () => {
    const { unicodeStampMap, traQStampMap } = constructStampNameIdMap(
      // reactiveのままだとiterateするのが遅くなるのでtoRawで生の値を取り出す
      toRaw(store.state.entities.stampsMap)
    )
    traQStampCategory.value = traQStampsToStampCategory(traQStampMap)
    unicodeStampCategories.value = await categorizeUnicodeStamps(
      unicodeStampMap
    )
  }

  constructStampCategories()
  entityMitt.on('setStamps', () => {
    constructStampCategories()
  })
  entityMitt.on('setStamp', () => {
    constructStampCategories()
  })
  entityMitt.on('deleteStamp', () => {
    constructStampCategories()
  })

  return { traQStampCategory, unicodeStampCategories }
})

export const useStampCategory = convertToRefsStore(useStampCategoryPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useStampCategoryPinia, import.meta.hot)
  )
}
