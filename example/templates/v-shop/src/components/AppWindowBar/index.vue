<script setup lang="ts">
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();

function onDarkToggle() {
  appStore.updateTheme({
    mode: appStore.theme.mode === 'dark' ? 'light' : 'dark',
  });
}
</script>

<template>
  <div class="app-window-bar">
    <!-- 暗黑主题 -->
    <teleport to="body">
      <div class="app-window-bar__theme" @click="onDarkToggle">
        <IconDark class="app-window-bar__theme-icon" />
      </div>
    </teleport>
    <!-- 返回顶部 -->
    <van-back-top class="top-bottom" teleport="body" />
  </div>
</template>

<style lang="less">
.app-window-bar {
  &__theme {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 30px;
    bottom: 110px;
    border-radius: 50%;
    color: var(--color-primary);
    background-color: var(--color-bg-2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);

    &-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.dark {
  .app-window-bar__theme {
    color: var(--color-text-1);
    background-color: var(--color-primary);
  }
}

.top-bottom {
  bottom: 60px !important;
}
</style>
