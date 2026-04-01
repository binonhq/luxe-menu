<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  images: string[]
  currentPage: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:totalPages': [pages: number]
}>()

const clampPage = (page: number) => Math.min(Math.max(page, 1), Math.max(props.images.length, 1))

const updatePage = (nextPage: number) => {
  const clamped = clampPage(nextPage)
  if (clamped !== props.currentPage) {
    emit('update:currentPage', clamped)
  }
}

const swipeStartX = ref<number | null>(null)
const swipeDeltaX = ref(0)

const onTouchStart = (event: TouchEvent) => {
  swipeStartX.value = event.touches[0]?.clientX ?? null
  swipeDeltaX.value = 0
}

const onTouchMove = (event: TouchEvent) => {
  if (swipeStartX.value === null) {
    return
  }

  swipeDeltaX.value = (event.touches[0]?.clientX ?? 0) - swipeStartX.value
}

const onTouchEnd = () => {
  if (swipeDeltaX.value < -70) {
    updatePage(props.currentPage + 1)
  }

  if (swipeDeltaX.value > 70) {
    updatePage(props.currentPage - 1)
  }

  swipeStartX.value = null
  swipeDeltaX.value = 0
}

watch(
  () => props.images,
  (images) => {
    emit('update:totalPages', images.length)

    if (images.length === 0) {
      emit('update:currentPage', 1)
      return
    }

    updatePage(props.currentPage)
  },
  { immediate: true }
)
</script>

<template>
  <section
    class="mx-auto flex w-full max-w-7xl grow items-center justify-center overflow-hidden px-1 py-3 sm:px-2 sm:py-6 md:px-4 md:py-10"
    @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend="onTouchEnd">
    <div class="flex h-full w-full pb-10 transition-transform duration-500 ease-out sm:pb-14 md:pb-20"
      :style="{ transform: `translateX(-${(currentPage - 1) * 100}%)` }">
      <article v-for="(imagePath, index) in images" :key="`h-page-${imagePath}`"
        class="flex h-full min-w-full items-center justify-center px-0 sm:px-2">
        <div
          class="book-shadow flex max-h-full w-full max-w-[980px] items-center justify-center rounded-xl border border-[#e8ddd3] bg-[#fffefc] p-1.5 sm:rounded-2xl sm:p-3">
          <img :src="imagePath" :alt="`Menu page ${index + 1}`" loading="eager" decoding="sync"
            class="block h-auto w-full max-w-full max-h-[72dvh] rounded-md object-contain sm:max-h-[82dvh] md:max-h-screen" />
        </div>
      </article>
    </div>
  </section>
</template>
