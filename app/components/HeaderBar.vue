<script setup lang="ts">
import type { LanguageCode, ViewMode } from '~/types/reader'

const props = defineProps<{
  language: LanguageCode
  viewMode: ViewMode
}>()

const emit = defineEmits<{
  'update:language': [value: LanguageCode]
  'update:viewMode': [value: ViewMode]
}>()

const modes: Array<{ value: ViewMode; icon: string; label: string }> = [
  { value: 'horizontal', icon: 'tabler:layout-columns', label: 'Horizontal mode' },
  { value: 'vertical', icon: 'tabler:layout-rows', label: 'Vertical mode' },
]

const languages: LanguageCode[] = ['EN', 'VI', 'CN', 'KOR', 'RUS']
</script>

<template>
  <header
    class="sticky w-full top-0 z-40 border-b border-[#e9dfd6]/80 bg-white/70 flex justify-between items-center gap-2 px-4 pb-3 pt-3 backdrop-blur-sm">

    <select :value="props.language"
      class="rounded-xl border border-[#e2d6cc] bg-[#fffdfa] px-3 py-2 text-[#3f342b] outline-none transition focus:border-[#ba9e89] focus:ring-2 focus:ring-[#ead8c9] h-fit"
      @change="emit('update:language', ($event.target as HTMLSelectElement).value as LanguageCode)">
      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
    </select>


    <div class="grid grid-cols-2 gap-1 rounded-xl border border-[#e2d6cc] bg-[#fffdfa] p-1">
      <button v-for="mode in modes" :key="mode.value" type="button"
        class="rounded-lg px-3 py-2 transition flex items-center justify-center" :class="props.viewMode === mode.value
          ? 'bg-[#e8d8cb] text-[#3f3022]'
          : 'text-[#7e6e62] hover:bg-[#f3ece6]'
          " :aria-label="mode.label" :title="mode.label" @click="emit('update:viewMode', mode.value)">
        <Icon :name="mode.icon" class="text-xl" />
      </button>
    </div>
  </header>
</template>
