<template>
  <div class="tab-control">
    <template v-for="(item, index) in titles" :key="index">
      <div class="tab-control-item"
          :class="{ active: index === currentIndex}"
          @click="itemClick(index)">
        <span>{{ item }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue"

defineProps({
  titles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['tabItemClick'])

const currentIndex = ref(0)

const itemClick = (index) => {
  currentIndex.value = index
  emit('tabItemClick', index)
}

const setCurrentIndex = (index) => {
  currentIndex.value = index
}

// 暴露变量和方法
defineExpose({
  currentIndex,
  setCurrentIndex
})

</script>

<style lang="less" scoped>
.tab-control {
  display: flex;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #fff;

  .tab-control-item {
    flex: 1;
  }

  .active {
    color: var(--primary-color);
    font-weight: 700;

    span {
      border-bottom: 3px solid var(--primary-color);
      padding: 8px;
    }
  }

}
</style>