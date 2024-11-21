<script setup lang="ts">
import useSettingsStore from '@/store/modules/settings'
import { Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'

const settingsStore = useSettingsStore()

Locale.use('zh-CN', zhCN)
</script>

<template>
  <VanConfigProvider :theme="settingsStore.currentColorScheme" class="min-h-vh supports-[(min-height:100dvh)]:min-h-dvh">
    <slot />
  </VanConfigProvider>
</template>
