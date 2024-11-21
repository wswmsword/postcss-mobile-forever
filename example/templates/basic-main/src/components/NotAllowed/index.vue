<script setup lang="ts">
defineOptions({
  name: 'NotAllowed',
})

const router = useRouter()

const data = ref({
  inter: Number.NaN,
  countdown: 5,
})

onUnmounted(() => {
  data.value.inter && window.clearInterval(data.value.inter)
})

onMounted(() => {
  data.value.inter = window.setInterval(() => {
    data.value.countdown--
    if (data.value.countdown === 0) {
      data.value.inter && window.clearInterval(data.value.inter)
      goBack()
    }
  }, 1000)
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <SvgIcon name="403" class="text-[300px] -mt-9xl" />
    <div class="flex flex-col items-center gap-4">
      <h1 class="m-0 text-6xl font-sans">
        403
      </h1>
      <div class="mx-0 text-xl text-stone-5">
        抱歉，你无权访问该页面
      </div>
      <div>
        <HButton @click="goBack">
          {{ data.countdown }} 秒后，返回首页
        </HButton>
      </div>
    </div>
  </div>
</template>
