<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  previous: []
  next: []
}>()

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)
</script>

<template>
  <nav class="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex justify-center px-4">
    <div
      class="pointer-events-auto flex items-center gap-3 rounded-full border border-[#e6dad0] bg-[rgba(255,253,250,0.9)] px-4 py-3 shadow-[0_10px_28px_rgba(72,46,26,0.16)] backdrop-blur">
      <button type="button"
        class="h-11 w-11 flex items-center justify-center rounded-full border border-[#e4d9cf] text-xl text-[#5f4c3e] transition hover:bg-[#f3eae3] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canGoPrevious" aria-label="Previous page" @click="emit('previous')">
        <Icon name="tabler:chevron-left" class="m-auto text-2xl" />
      </button>

      <p class="min-w-20 text-center text-sm font-semibold tracking-wide text-[#6d5a4c]">
        {{ props.currentPage }} / {{ props.totalPages || 0 }}
      </p>

      <button type="button"
        class="h-11 w-11 flex items-center justify-center rounded-full border border-[#e4d9cf] text-xl text-[#5f4c3e] transition hover:bg-[#f3eae3] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canGoNext" aria-label="Next page" @click="emit('next')">
        <Icon name="tabler:chevron-right" class="m-auto text-2xl" />
      </button>
    </div>
  </nav>
</template>
