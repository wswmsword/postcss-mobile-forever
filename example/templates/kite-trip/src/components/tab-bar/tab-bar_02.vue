<template>
  <div class="tab-bar">
    <template v-for="(item, index) in tabbarData" :key="index">
      <div 
        class="tab-bar-item" 
        :class="{ active: currentIndex === index }"
        @click="itemClick(index, item)">
        <img v-if="currentIndex !== index" :src="getAssetsURL(item.image)">
        <img v-else :src="getAssetsURL(item.imageActive)">
        <span class="text">{{ item.text }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
// 1.首先完成任务 2.代码简洁/优雅 3.可复用性/可维护性/可扩展性 (封装、抽取)

import tabbarData from "@/assets/data/tabbar.js"
import { getAssetsURL } from '@/utils/load_assets.js'
import { ref } from "vue"
import { useRouter } from "vue-router"

const currentIndex = ref(0)
const router = useRouter()
const itemClick = (index, item) => {
  currentIndex.value = index
  router.push(item.path)
}

</script>

<style lang="less" scoped>
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  display: flex;

  border-top: 1px solid #f3f3f3;

  .tab-bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &.active {
      color: var(--primary-color)
    }

    img {
      width: 36px;
    }

    .text {
      font-size: 12px;
    }
  }
}
</style>