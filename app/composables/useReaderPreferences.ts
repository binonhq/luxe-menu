import { shallowRef, watch } from 'vue'
import type { ViewMode } from '~/types/reader'

const VIEW_MODE_KEY = 'luxe-menu:view-mode'

export function useReaderPreferences() {
  const viewMode = shallowRef<ViewMode>('vertical')

  if (import.meta.client) {
    const storedMode = localStorage.getItem(VIEW_MODE_KEY)
    if (storedMode === 'vertical' || storedMode === 'horizontal') {
      viewMode.value = storedMode
    }
  }

  watch(viewMode, (mode) => {
    if (!import.meta.client) {
      return
    }

    localStorage.setItem(VIEW_MODE_KEY, mode)
  })

  return {
    viewMode
  }
}
