<template>
  <div class="city top-page">
    <div class="top">
      <!-- 1. 搜索框 -->
      <van-search 
        v-model="searchValue"
        placeholder="城市/区域/位置"
        shape="round"
        show-action
        @cancel="cancelClick"
      />

      <!-- 2. tab的切换 -->
      <!-- tabActive默认是索引 -->
      <van-tabs v-model:active="tabActive" color="#ff9854">
        <template v-for="(value, key, index) in allCities" :key="index">
          <van-tab :title="value.title" :name="key"></van-tab>
        </template>
      </van-tabs>
    </div>
    <div class="content">
      <template v-for="(value, key, index) in allCities" :key="index">
        <city-group v-show="tabActive === key" :groupData="value" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import userCityStore from "@/stores/modules/city"
import { useRouter } from "vue-router"
import { getCityAll } from "@/service"

import CityGroup from './cpns/city-group.vue'

const router = useRouter()

// 搜索框功能
const searchValue = ref("")
const cancelClick = () => {
  router.back()
}

// tab的切换
const tabActive = ref()

/**
 * 这个位置发送网络请求有两个缺点:
 * 1. 如果网络请求太多, 那么页面组件中就包含大量的对于网络请求和数据的处理逻辑
 * 2. 如果页面封装了很多的子组件, 子组件需要这些数据, 我们必须一步步将数据传递过去(props)
 */
// 网络请求: 请求城市的数据
// const allCity = ref({})
// getCityAll().then(res => {
//   allCity.value = res.data
// })

// 从store中获取数据
const cityStore = userCityStore()
cityStore.fetchAllCitiesData()
const { allCities } = storeToRefs(cityStore)

// 目的: 获取选中标签后的数据
// 1. 获取正确的key: 将tabs中绑定的tabAction正确绑定
// 2. 根据key从allCities获取数据, 默认直接获取的数据不是响应式的, 所以必须包裹computed
// 2.1. 页面上直接遍历 allCities[tabActive]?.cities
const currentGroup = computed(() => allCities.value[tabActive.value])

</script>

<style lang="less" scoped>
.city {
  // --van-tabs-line-height: 30px;

  // .top {
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  // }

  .top {
    position: relative;
    z-index: 9;
  }

  // .content {
  //   margin-top: 98px
  // }

  // 局部滚动 (内容固定高度)
  .content {
    height: calc(100vh - 98px);
    overflow-y: auto;
  }

}
</style>