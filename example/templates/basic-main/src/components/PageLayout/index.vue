<script setup lang="ts">
import useSettingsStore from '@/store/modules/settings'
import { useElementSize } from '@vueuse/core'

defineOptions({
  name: 'PageLayout',
})

withDefaults(
  defineProps<{
    /** 是否启用导航栏，默认使用应用配置 `navbar.enable` */
    navbar?: boolean
    /** 是否启用标签栏，默认使用应用配置 `tabbar.enable` */
    tabbar?: boolean
    /** 是否展示底部版权信息，默认使用应用配置 `copyright.enable` */
    copyright?: boolean
    /** 是否启用返回顶部按钮，默认使用应用配置 `app.enableBackTop` */
    backTop?: boolean
  }>(),
  {
    navbar: undefined,
    tabbar: undefined,
    copyright: undefined,
    backTop: undefined,
  },
)

const emits = defineEmits<{
  scroll: [Event]
  reachTop: []
  reachBottom: []
}>()

const route = useRoute()
const settingsStore = useSettingsStore()

const layoutRef = useTemplateRef('layoutRef')
defineExpose({
  ref: layoutRef,
})
function handleMainScroll(e: Event) {
  handleNavbarScroll()
  handleTabbarScroll()
  handleBackTopScroll()
  emits('scroll', e)
  if ((e.target as HTMLElement).scrollTop === 0) {
    emits('reachTop')
  }
  if (Math.ceil((e.target as HTMLElement).scrollTop + (e.target as HTMLElement).clientHeight) >= (e.target as HTMLElement).scrollHeight) {
    emits('reachBottom')
  }
}
onMounted(() => {
  handleNavbarScroll()
  handleTabbarScroll()
  handleBackTopScroll()
})
onActivated(() => {
  handleNavbarScroll()
  handleTabbarScroll()
  handleBackTopScroll()
})

// Navbar
// 计算出左右两侧的最大宽度，让左右两侧的宽度保持一致
const startSideRef = useTemplateRef('startSideRef')
const endSideRef = useTemplateRef('endSideRef')
const sideWidth = ref(0)
onMounted(() => {
  const { width: startWidth } = useElementSize(startSideRef, undefined, { box: 'border-box' })
  const { width: endWidth } = useElementSize(endSideRef, undefined, { box: 'border-box' })
  watch([startWidth, endWidth], (val) => {
    sideWidth.value = Math.max(...val)
  }, {
    immediate: true,
  })
})
const navbarScrollTop = ref(0)
function handleNavbarScroll() {
  navbarScrollTop.value = layoutRef.value?.scrollTop ?? 0
}

// Tabbar
const showTabbarShadow = ref(false)
function handleTabbarScroll() {
  const scrollTop = layoutRef.value?.scrollTop ?? 0
  const clientHeight = layoutRef.value?.clientHeight ?? 0
  const scrollHeight = layoutRef.value?.scrollHeight ?? 0
  showTabbarShadow.value = Math.ceil(scrollTop + clientHeight) < scrollHeight
}
const tabbarList = computed(() => {
  if (settingsStore.settings.tabbar.list.length > 0) {
    return settingsStore.settings.tabbar.list
  }
  return []
})
function getIcon(item: any) {
  if (route.fullPath === item.path) {
    return item.activeIcon ?? item.icon ?? undefined
  }
  else {
    return item.icon ?? undefined
  }
}

// 返回顶部
const backTopScrollTop = ref(0)
function handleBackTopScroll() {
  backTopScrollTop.value = layoutRef.value?.scrollTop ?? 0
}
function handleBackTopClick() {
  layoutRef.value?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div ref="layoutRef" class="relative h-vh flex flex-col overflow-auto overscroll-none supports-[(height:100dvh)]:h-dvh" @scroll="handleMainScroll">
    <!-- Navbar -->
    <header
      v-show="navbar ?? settingsStore.settings.navbar.enable" class="navbar w-full flex-center bg-[var(--g-navbar-bg)] text-[var(--g-navbar-color)] transition-all pt-safe h+safe-t-[var(--g-navbar-height)]" :class="{
        'shadow-top': navbarScrollTop,
      }"
    >
      <div
        class="h-full flex items-center justify-start" :style="{
          ...(sideWidth && { width: `${sideWidth}px` }),
        }"
      >
        <div ref="startSideRef" class="h-full flex-center whitespace-nowrap">
          <div class="h-full flex-center whitespace-nowrap px-2">
            <slot name="navbar-start" />
          </div>
        </div>
      </div>
      <div class="min-w-0 flex-1 text-center text-sm">
        <div class="truncate">
          {{ settingsStore.title }}
        </div>
      </div>
      <div
        class="h-full flex items-center justify-end" :style="{
          ...(sideWidth && { width: `${sideWidth}px` }),
        }"
      >
        <div ref="endSideRef" class="h-full flex-center whitespace-nowrap">
          <div class="h-full flex-center whitespace-nowrap px-2">
            <slot name="navbar-end" />
          </div>
        </div>
      </div>
    </header>
    <div
      class="relative flex flex-1 flex-col transition-margin" :class="{
        'mt+safe-[var(--g-navbar-height)]': navbar ?? settingsStore.settings.navbar.enable,
        'mb+safe-[var(--g-tabbar-height)]': tabbar ?? settingsStore.settings.tabbar.enable,
      }"
    >
      <slot />
      <!-- 版权信息 -->
      <Transition
        v-bind="{
          enterActiveClass: 'ease-out',
          enterFromClass: 'opacity-0',
          enterToClass: 'opacity-100',
          leaveActiveClass: 'ease-in',
          leaveFromClass: 'opacity-100',
          leaveToClass: 'opacity-0',
        }"
      >
        <div v-if="copyright ?? settingsStore.settings.copyright.enable" class="copyright relative flex flex-wrap items-center justify-center p-4 text-sm text-stone-5 mix-blend-difference">
          <span class="px-1">Copyright</span>
          <SvgIcon name="i-ri:copyright-line" class="text-lg" />
          <span v-if="settingsStore.settings.copyright.dates" class="px-1">{{ settingsStore.settings.copyright.dates }}</span>
          <template v-if="settingsStore.settings.copyright.company">
            <a v-if="settingsStore.settings.copyright.website" :href="settingsStore.settings.copyright.website" target="_blank" rel="noopener" class="px-1 text-center text-stone-5 no-underline">{{ settingsStore.settings.copyright.company }}</a>
            <span v-else class="px-1">{{ settingsStore.settings.copyright.company }}</span>
          </template>
          <a v-if="settingsStore.settings.copyright.beian" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" class="px-1 text-center text-stone-5 no-underline">{{ settingsStore.settings.copyright.beian }}</a>
        </div>
      </Transition>
    </div>
    <!-- Tabbar -->
    <footer
      v-show="tabbar ?? settingsStore.settings.tabbar.enable" class="tabbar w-full bg-[var(--g-tabbar-bg)] transition-all pb-safe h+safe-b-[calc(var(--g-tabbar-height))]" :class="{
        'shadow-bottom': showTabbarShadow,
      }"
    >
      <div class="h-full flex-center px-4">
        <slot name="tabbar">
          <RouterLink
            v-for="item in tabbarList" :key="JSON.stringify(item)" class="flex flex-1 flex-col items-center gap-[2px] text-[var(--g-tabbar-color)] no-underline transition-all" :class="{
              'text-[var(--g-tabbar-active-color)]!': route.fullPath === item.path,
            }" :to="item.path" replace
          >
            <SvgIcon v-if="getIcon(item)" :name="getIcon(item) ?? ''" :class="item.text ? 'text-6' : 'text-8'" />
            <div v-if="item.text" class="text-xs">
              {{ item.text }}
            </div>
          </RouterLink>
        </slot>
      </div>
    </footer>
    <!-- 返回顶部 -->
    <Transition
      v-bind="{
        enterActiveClass: 'ease-out duration-300',
        enterFromClass: 'opacity-0 translate-y-4',
        enterToClass: 'opacity-100 translate-y-0',
        leaveActiveClass: 'ease-in duration-200',
        leaveFromClass: 'opacity-100 scale-100',
        leaveToClass: 'opacity-0 scale-50',
      }"
    >
      <div
        v-if="(backTop ?? settingsStore.settings.app.enableBackTop) && backTopScrollTop >= 200" class="backtop h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-stone-3 ring-inset active:bg-stone-1 dark-bg-dark dark-ring-stone-7 dark-active:bg-stone-9" :class="{
          'bottom+safe-[calc(var(--g-tabbar-height)+16px)]!': tabbar ?? settingsStore.settings.tabbar.enable,
        }" @click="handleBackTopClick"
      >
        <SvgIcon name="i-icon-park-outline:to-top-one" class="text-6" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;

  &.shadow-top {
    box-shadow: 0 10px 10px -10px var(--g-border-color);
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 100%;

  &.shadow-bottom {
    box-shadow: 0 -10px 10px -10px var(--g-border-color);
  }
}

.backtop {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
}
</style>
