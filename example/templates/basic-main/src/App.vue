<script setup lang="ts">
import useKeepAliveStore from '@/store/modules/keepAlive'
import useSettingsStore from '@/store/modules/settings'
import eventBus from '@/utils/eventBus'
import Provider from './ui-provider/index.vue'

const route = useRoute()

const settingsStore = useSettingsStore()
const keepAliveStore = useKeepAliveStore()

const { auth } = useAuth()

const isAuth = computed(() => {
  return route.matched.every((item) => {
    return item.meta.auth ? (item.meta.auth === true ? true : auth(item.meta.auth)) : true
  })
})

watch([
  () => settingsStore.settings.app.enableDynamicTitle,
  () => settingsStore.title,
], () => {
  nextTick(() => {
    if (settingsStore.settings.app.enableDynamicTitle && settingsStore.title) {
      document.title = settingsStore.title ?? import.meta.env.VITE_APP_TITLE
    }
    else {
      document.title = import.meta.env.VITE_APP_TITLE
    }
  })
}, {
  immediate: true,
  deep: true,
})

const enableAppSetting = import.meta.env.VITE_APP_SETTING === 'true'
</script>

<template>
  <Provider>
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in" appear>
        <KeepAlive :include="keepAliveStore.list">
          <component :is="Component" v-if="isAuth" :key="route.fullPath" />
          <NotAllowed v-else />
        </KeepAlive>
      </Transition>
    </RouterView>
    <template v-if="enableAppSetting">
      <div class="app-setting" @click="eventBus.emit('global-app-setting-toggle')">
        <SvgIcon name="i-uiw:setting-o" class="icon" />
      </div>
      <AppSetting />
    </template>
  </Provider>
</template>

<style scoped>
.app-setting {
  --uno: text-white dark-text-dark bg-ui-primary;

  position: fixed;
  top: 70%;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  border-radius: 5px 0 0 5px;

  .icon {
    animation: rotate 5s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}

.navbar-enter-active,
.navbar-leave-active {
  transition: transform 0.15s ease-in-out;
}

.navbar-enter-from,
.navbar-leave-to {
  transform: translateY(-100%);
}

.tabbar-enter-active,
.tabbar-leave-active {
  transition: transform 0.15s ease-in-out;
}

.tabbar-enter-from,
.tabbar-leave-to {
  transform: translateY(100%);
}

/* 主内容区动画 */
.fade-enter-active {
  transition: 0.2s;
}

.fade-leave-active {
  transition: 0.15s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}
</style>
