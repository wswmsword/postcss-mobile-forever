<script setup lang="ts">
import useUserStore from '@/store/modules/user'

definePage({
  meta: {
    title: '个人中心',
    auth: true,
  },
})

const userStore = useUserStore()

const avatarError = ref(false)
watch(() => userStore.avatar, () => {
  if (avatarError.value) {
    avatarError.value = false
  }
})
</script>

<template>
  <PageLayout :navbar="false" tabbar>
    <div class="flex flex-1 flex-col gap-8 p-4">
      <div class="flex flex-1 flex-col gap-4">
        <div class="flex items-center justify-end gap-4">
          <HBadge :value="10">
            <SvgIcon name="i-carbon:notification" class="text-6" />
          </HBadge>
          <SvgIcon name="i-carbon:settings" class="text-6" />
        </div>
        <div class="flex items-center gap-4">
          <img v-if="userStore.avatar && !avatarError" :src="userStore.avatar" :onerror="() => (avatarError = true)" class="h-20 w-20 rounded-full bg-dark p-2 dark-bg-light">
          <SvgIcon v-else name="i-carbon:user-avatar-filled-alt" class="text-20 text-gray-400" />
          <div>
            <div class="text-8 font-bold">
              Hi, {{ userStore.account }}
            </div>
            <div class="mt-1 text-stone-5">
              这是个人中心示例页面噢~
            </div>
          </div>
        </div>
      </div>
      <HButton block @click="userStore.logout()">
        登出
      </HButton>
    </div>
  </PageLayout>
</template>
