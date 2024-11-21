<script setup lang="ts">
definePage({
  name: 'reload',
  meta: {
    title: '刷新页面',
    navbar: {
      enable: false,
    },
  },
})

const router = useRouter()

onMounted(() => {
  router.go(-1)
})
</script>

<template>
  <div />
</template>
