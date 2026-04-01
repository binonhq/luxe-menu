<script setup lang="ts">
import HeaderBar from '~/components/HeaderBar.vue'
import HorizontalImageViewer from '~/components/HorizontalImageViewer.vue'
import PageNavigator from '~/components/PageNavigator.vue'
import VerticalImageViewer from '~/components/VerticalImageViewer.vue'
import { useReaderPreferences } from '~/composables/useReaderPreferences'
import type { LanguageCode, MenuImagesByLanguage } from '~/types/reader'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()

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

const buildImagePaths = (languageCode: string, totalPages: number): string[] =>
  Array.from({ length: totalPages }, (_, index) => `/menus/${languageCode}/${index + 1}.png`)

const menus = computed<MenuImagesByLanguage>(() => ({
  EN: buildImagePaths('en', 15),
  VI: buildImagePaths('vi', 15),
  CN: buildImagePaths('cn', 15),
  KOR: buildImagePaths('kor', 15),
  RUS: buildImagePaths('rus', 15)
}))

const selectedLanguageImages = computed(() => menus.value[language.value] ?? [])
const isHorizontalMode = computed(() => viewMode.value === 'horizontal')
const siteName = 'Luxe Hair Salon & Spa'

const seoByLanguage: Record<LanguageCode, { title: string; description: string }> = {
  EN: {
    title: `${siteName} | Service Menu`,
    description:
      'Explore the Luxe Hair Salon & Spa service menu in an elegant digital reader with vertical and book-style modes.',
  },
  VI: {
    title: `${siteName} | Bang gia dich vu`,
    description:
      'Kham pha bang gia dich vu Luxe Hair Salon & Spa voi trinh doc menu sang trong, ho tro che do doc doc va lat trang.',
  },
  CN: {
    title: `${siteName} | 服务菜单`,
    description:
      '通过优雅的数字阅读器查看 Luxe Hair Salon & Spa 服务菜单，支持纵向滚动与翻页两种阅读模式。',
  },
  KOR: {
    title: `${siteName} | 서비스 메뉴`,
    description:
      '세련된 디지털 리더로 Luxe Hair Salon & Spa의 서비스 메뉴를 확인하세요. 세로 보기와 페이지 넘김 모드를 모두 지원합니다.',
  },
  RUS: {
    title: `${siteName} | Меню услуг`,
    description:
      'Изучайте меню услуг Luxe Hair Salon & Spa в элегантном цифровом ридере с вертикальным и книжным режимами просмотра.',
  },
}

const localizedSeo = computed(() => seoByLanguage[language.value] ?? seoByLanguage.EN)

const siteOrigin = computed(() => {
  const configuredSiteUrl = String(runtimeConfig.public.siteUrl ?? '').trim().replace(/\/$/, '')
  if (configuredSiteUrl) {
    return configuredSiteUrl
  }

  return requestUrl.origin.replace(/\/$/, '')
})

const currentPathWithQuery = computed(() => route.fullPath.split('#')[0] || '/')

const canonicalUrl = computed(() => `${siteOrigin.value}${currentPathWithQuery.value}`)

const shareImageUrl = computed(() => {
  return `${siteOrigin.value}/preview.png`
})

useSeoMeta({
  title: () => localizedSeo.value.title,
  description: () => localizedSeo.value.description,
  ogType: 'website',
  ogSiteName: siteName,
  ogTitle: () => localizedSeo.value.title,
  ogDescription: () => localizedSeo.value.description,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => shareImageUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => localizedSeo.value.title,
  twitterDescription: () => localizedSeo.value.description,
  twitterImage: () => shareImageUrl.value,
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})

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

    <VerticalImageViewer v-if="viewMode === 'vertical'" :images="selectedLanguageImages"
      @update:total-pages="totalPages = $event" />

    <HorizontalImageViewer v-else :images="selectedLanguageImages" :current-page="currentPage"
      @update:current-page="currentPage = $event" @update:total-pages="totalPages = $event" />

    <PageNavigator v-if="isHorizontalMode" :current-page="currentPage" :total-pages="totalPages" @previous="goPrevious"
      @next="goNext" />
  </div>
</template>
