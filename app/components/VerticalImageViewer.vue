<script setup lang="ts">
import { ref, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'

const props = defineProps<{
  images: string[]
}>()

const emit = defineEmits<{
  'update:totalPages': [pages: number]
}>()

const verticalScrollRef = ref<HTMLDivElement | null>(null)
const visibleCount = ref(0)

const CHUNK_SIZE = 4

const visibleImages = computed(() => props.images.slice(0, visibleCount.value))

useInfiniteScroll(
  verticalScrollRef,
  () => {
    if (visibleCount.value >= props.images.length) {
      return
    }

    visibleCount.value = Math.min(visibleCount.value + CHUNK_SIZE, props.images.length)
  },
  {
    distance: 280,
    canLoadMore: () => visibleCount.value < props.images.length
  }
)

watch(
  () => props.images,
  (images) => {
    emit('update:totalPages', images.length)

    if (images.length === 0) {
      visibleCount.value = 0
      return
    }

    visibleCount.value = Math.min(CHUNK_SIZE, images.length)
  },
  { immediate: true }
)
</script>

<template>
  <section ref="verticalScrollRef" class="w-full overflow-y-auto px-4">
    <TransitionGroup name="stack" tag="div" class="mx-auto max-w-7xl flex w-full max-w-[920px] flex-col gap-4 py-4">
      <article v-for="(imagePath, index) in visibleImages" :key="`v-page-${imagePath}`"
        class="book-shadow mx-auto flex w-full justify-center rounded-2xl border border-[#e8ddd3] bg-[#fffefc] p-3">
        <img :src="imagePath" :alt="`Menu page ${index + 1}`" loading="lazy" decoding="async"
          class="max-w-full rounded-md" />
      </article>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.stack-enter-active,
.stack-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.stack-enter-from,
.stack-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
