<script setup lang="ts">
import HeaderBar from '~/components/HeaderBar.vue'
import HorizontalImageViewer from '~/components/HorizontalImageViewer.vue'
import PageNavigator from '~/components/PageNavigator.vue'
import VerticalImageViewer from '~/components/VerticalImageViewer.vue'
import { useReaderPreferences } from '~/composables/useReaderPreferences'
import { type LanguageCode, type MenuImagesByLanguage } from '~/types/reader'

const route = useRoute()
const router = useRouter()

const QUERY_TO_LANGUAGE: Record<string, LanguageCode> = {
  en: 'EN',
  vi: 'VI',
  cn: 'CN',
  kor: 'KOR',
  rus: 'RUS'
}

const LANGUAGE_TO_QUERY: Record<LanguageCode, string> = {
  EN: 'en',
  VI: 'vi',
  CN: 'cn',
  KOR: 'kor',
  RUS: 'rus'
}

const resolveLanguageFromQuery = (value: unknown): LanguageCode => {
  const queryValue = Array.isArray(value) ? value[0] : value
  if (typeof queryValue !== 'string') {
    return 'VI'
  }

  return QUERY_TO_LANGUAGE[queryValue.toLowerCase()] ?? 'VI'
}

const language = shallowRef<LanguageCode>(resolveLanguageFromQuery(route.query.lang))
const currentPage = shallowRef(1)
const totalPages = shallowRef(0)

const { viewMode } = useReaderPreferences()

const { data, status } = await useFetch<{ menus: MenuImagesByLanguage }>('/api/menus')

const menus = computed<MenuImagesByLanguage>(() =>
  data.value?.menus ?? {
    EN: [],
    VI: [],
    CN: [],
    KOR: [],
    RUS: []
  }
)

const selectedLanguageImages = computed(() => menus.value[language.value] ?? [])
const isHorizontalMode = computed(() => viewMode.value === 'horizontal')

const initialScrollStyles = {
  htmlOverflow: '',
  htmlOverscrollBehavior: '',
  bodyOverflow: '',
  bodyOverscrollBehavior: ''
}

let hasSavedScrollStyles = false

const setDocumentScrollLock = (isLocked: boolean) => {
  if (!import.meta.client) {
    return
  }

  const html = document.documentElement
  const body = document.body

  if (isLocked) {
    if (!hasSavedScrollStyles) {
      initialScrollStyles.htmlOverflow = html.style.overflow
      initialScrollStyles.htmlOverscrollBehavior = html.style.overscrollBehavior
      initialScrollStyles.bodyOverflow = body.style.overflow
      initialScrollStyles.bodyOverscrollBehavior = body.style.overscrollBehavior
      hasSavedScrollStyles = true
    }

    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    return
  }

  if (!hasSavedScrollStyles) {
    return
  }

  html.style.overflow = initialScrollStyles.htmlOverflow
  html.style.overscrollBehavior = initialScrollStyles.htmlOverscrollBehavior
  body.style.overflow = initialScrollStyles.bodyOverflow
  body.style.overscrollBehavior = initialScrollStyles.bodyOverscrollBehavior
  hasSavedScrollStyles = false
}

watch(
  language,
  () => {
    currentPage.value = 1
  },
  { immediate: true }
)

watch(
  () => route.query.lang,
  (queryLanguage) => {
    const resolvedLanguage = resolveLanguageFromQuery(queryLanguage)
    if (resolvedLanguage !== language.value) {
      language.value = resolvedLanguage
    }
  }
)

watch(
  language,
  async (nextLanguage) => {
    const queryLanguage = Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang
    const nextQueryLanguage = LANGUAGE_TO_QUERY[nextLanguage]

    if (queryLanguage === nextQueryLanguage) {
      return
    }

    await router.replace({
      query: {
        ...route.query,
        lang: nextQueryLanguage
      }
    })
  },
  { immediate: true }
)

watch(selectedLanguageImages, (images) => {
  if (images.length === 0) {
    currentPage.value = 1
    return
  }

  if (currentPage.value > images.length) {
    currentPage.value = images.length
  }
})

watch(viewMode, () => {
  currentPage.value = 1

  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
})

watch(
  isHorizontalMode,
  (isLocked) => {
    setDocumentScrollLock(isLocked)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  setDocumentScrollLock(false)
})

const goPrevious = () => {
  currentPage.value = Math.max(currentPage.value - 1, 1)
}

const goNext = () => {
  currentPage.value = Math.min(currentPage.value + 1, totalPages.value || 1)
}
</script>

<template>
  <div class="relative flex min-h-dvh max-h-dvh flex-col" :class="isHorizontalMode ? 'overflow-hidden' : ''">
    <div class="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div class="absolute -left-20 top-16 h-64 w-64 rounded-full bg-[#efe0d1]/60 blur-3xl" />
      <div class="absolute bottom-20 right-[-6rem] h-80 w-80 rounded-full bg-[#e4d1be]/45 blur-3xl" />
    </div>

    <NuxtRouteAnnouncer />

    <HeaderBar :language="language" :view-mode="viewMode" @update:language="language = $event"
      @update:view-mode="viewMode = $event" />

    <div v-if="status === 'pending'"
      class="mx-auto mt-20 rounded-2xl border border-[#e3d8cf] bg-white/75 px-8 py-6 text-[#7e6e62]">
      Loading menu catalog...
    </div>

    <VerticalImageViewer v-else-if="viewMode === 'vertical'" :images="selectedLanguageImages"
      @update:total-pages="totalPages = $event" />

    <HorizontalImageViewer v-else :images="selectedLanguageImages" :current-page="currentPage"
      @update:current-page="currentPage = $event" @update:total-pages="totalPages = $event" />

    <PageNavigator v-if="isHorizontalMode" :current-page="currentPage" :total-pages="totalPages" @previous="goPrevious"
      @next="goNext" />
  </div>
</template>
