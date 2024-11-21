<script setup lang="ts">
import settingsDefault from '@/settings.default'
import useSettingsStore from '@/store/modules/settings'
import { getTwoObjectDiff } from '@/utils'
import eventBus from '@/utils/eventBus'
import { useClipboard } from '@vueuse/core'
import Message from 'vue-m-message'

defineOptions({
  name: 'AppSetting',
})

const settingsStore = useSettingsStore()

const isShow = ref(false)

onMounted(() => {
  eventBus.on('global-app-setting-toggle', () => {
    isShow.value = !isShow.value
  })
})

const { copy, copied, isSupported } = useClipboard()

watch(copied, (val) => {
  if (val) {
    Message.success('复制成功，请粘贴到 src/settings.ts 文件中！', {
      zIndex: 2000,
    })
  }
})

function handleCopy() {
  copy(JSON.stringify(getTwoObjectDiff(settingsDefault, settingsStore.settings), null, 2))
}
</script>

<template>
  <HSlideover v-model="isShow" title="应用配置">
    <div class="rounded-2 bg-rose/20 px-4 py-2 text-sm/6 c-rose">
      <p class="my-1">
        应用配置可实时预览效果，但只是临时生效，要想真正应用于项目，可以点击下方的「复制配置」按钮，并将配置粘贴到 src/settings.ts 文件中。
      </p>
      <p class="my-1">
        注意：在生产环境中应关闭该模块。
      </p>
    </div>
    <div>
      <div class="my-4 flex items-center justify-between gap-4 whitespace-nowrap text-sm font-500 after:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6) before:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6)">
        颜色主题风格
      </div>
      <div class="flex items-center justify-center pb-4">
        <HTabList
          v-model="settingsStore.settings.app.colorScheme"
          :options="[
            { icon: 'i-ri:sun-line', label: '明亮', value: 'light' },
            { icon: 'i-ri:moon-line', label: '暗黑', value: 'dark' },
            { icon: 'i-codicon:color-mode', label: '系统', value: '' },
          ]"
          class="w-60"
        />
      </div>
    </div>
    <div>
      <div class="my-4 flex items-center justify-between gap-4 whitespace-nowrap text-sm font-500 after:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6) before:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6)">
        底部版权
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          是否启用
        </div>
        <HToggle v-model="settingsStore.settings.copyright.enable" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          日期
        </div>
        <HInput v-model="settingsStore.settings.copyright.dates" :disabled="!settingsStore.settings.copyright.enable" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          公司
        </div>
        <HInput v-model="settingsStore.settings.copyright.company" :disabled="!settingsStore.settings.copyright.enable" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          网址
        </div>
        <HInput v-model="settingsStore.settings.copyright.website" :disabled="!settingsStore.settings.copyright.enable" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          备案
        </div>
        <HInput v-model="settingsStore.settings.copyright.beian" :disabled="!settingsStore.settings.copyright.enable" />
      </div>
    </div>
    <div>
      <div class="my-4 flex items-center justify-between gap-4 whitespace-nowrap text-sm font-500 after:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6) before:(h-[1px] w-full bg-stone-2 content-empty dark-bg-stone-6)">
        其它
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          是否启用权限
        </div>
        <HToggle v-model="settingsStore.settings.app.enablePermission" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          载入进度条
        </div>
        <HToggle v-model="settingsStore.settings.app.enableProgress" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          哀悼模式
        </div>
        <HToggle v-model="settingsStore.settings.app.enableMournMode" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          色弱模式
        </div>
        <HToggle v-model="settingsStore.settings.app.enableColorAmblyopiaMode" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          返回顶部
        </div>
        <HToggle v-model="settingsStore.settings.app.enableBackTop" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-2 px-4 py-2">
        <div class="flex flex-shrink-0 items-center gap-2 text-sm">
          动态标题
        </div>
        <HToggle v-model="settingsStore.settings.app.enableDynamicTitle" />
      </div>
    </div>
    <template v-if="isSupported" #footer>
      <HButton block @click="handleCopy">
        <SvgIcon name="i-ep:document-copy" />
        复制配置
      </HButton>
    </template>
  </HSlideover>
</template>
