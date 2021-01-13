import store from '@/store'
import createTree from '@/lib/trieTree'
import { nextTick, ComputedRef, WritableComputedRef } from 'vue'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'

const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
  text = text.replaceAll('　', ' ')
  const startIndex = elm.selectionStart
  const prevAtMarkIndex = text.lastIndexOf('@', startIndex - 1)
  const prevColonIndex = text.lastIndexOf(':', startIndex - 1)
  const prevPeriodIndex = text.lastIndexOf('.', startIndex - 1)
  const nearest = Math.max(prevAtMarkIndex, prevColonIndex, prevPeriodIndex)
  const begin = nearest < 0 ? 0 : nearest
  const end = elm.selectionEnd
  const word = text.substring(begin, end)
  return { word, begin, end }
}

const getDeterminedCharacters = (candidates: string[]) => {
  const minLength = Math.min(...candidates.map(c => c.length))
  const determined: string[] = []
  for (let i = 0; i < minLength; i++) {
    determined[i] = [...candidates[0]][i]
    for (const candidate of candidates) {
      if (determined[i] !== [...candidate][i]) {
        return determined.slice(0, determined.length - 1).join('')
      }
    }
  }
  return determined.join('')
}

const useWordCompleter = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const tree = createTree(
    store.getters.entities.allUserNames.map(userName => '@' + userName),
    store.getters.entities.allUserGroupNames.map(
      userGroupName => '@' + userGroupName
    ),
    store.getters.entities.allStampNames.map(
      stampName => ':' + stampName + ':'
    ),
    [...animeEffectSet].map(effectName => '.' + effectName),
    [...sizeEffectSet].map(effectName => '.' + effectName)
  )
  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.isComposing) {
      e.preventDefault()
      if (!textareaRef.value) return
      const target = getCurrentWord(textareaRef.value, value.value)
      const candidates = tree.search(target.word)
      if (candidates.length === 0) {
        return
      }
      const determined = getDeterminedCharacters(candidates)
      value.value =
        value.value.slice(0, target.begin) +
        determined +
        (target.end === value.value.length ? '' : value.value.slice(target.end))
      await nextTick()
      textareaRef.value.setSelectionRange(
        target.begin + determined.length,
        target.begin + determined.length
      )
    }
  }
  return { onKeyDown }
}

export default useWordCompleter
