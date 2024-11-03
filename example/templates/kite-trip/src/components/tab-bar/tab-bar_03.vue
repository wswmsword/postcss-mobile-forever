<template>
  <div class="tab-bar">
    <van-tabbar v-model="currentIndex" active-color="#ff9854">
      <template v-for="(item, index) in tabbarData" :key="index">
        <van-tabbar-item :to="item.path" icon="home-o">
          <span>{{ item.text }}</span>
        </van-tabbar-item>
      </template>
    </van-tabbar>
  </div>
</template>

<script setup>
// 1.首先完成任务 2.代码简洁/优雅 3.可复用性/可维护性/可扩展性 (封装、抽取)

import tabbarData from "@/assets/data/tabbar.js"
import { getAssetsURL } from '@/utils/load_assets.js'
import { ref } from "vue"

const currentIndex = ref(0)


</script>

<style lang="less" scoped>
.tab-bar {

  // 局部定义一个变量，只针对 tabbar 子元素才生效
  // --van-tabbar-item-icon-size: 30px !important;

  // 找到类，对类中的CSS属性重写
  // :deep(.class) 找到子组件的类，让子组件的类也可以生效
  :deep(.van-tabbar-item__icon) {
    font-size: 50px;
  }
}
</style>