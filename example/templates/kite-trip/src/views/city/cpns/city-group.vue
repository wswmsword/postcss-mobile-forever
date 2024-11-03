<template>
  <div class="city-group">
    <van-index-bar highlight-color="#ff9854" :indexList="indexList">

      <van-index-anchor index="热门" />
      <div class="list">
        <template v-for="(city, index) in groupData.hotCities" :key="index">
          <div class="city" @click="cityClick(city)">
            {{ city.cityName }}
          </div>
        </template>
      </div>

      <template v-for="(group, index) in groupData.cities" :key="index">
        <van-index-anchor :index="group.group" />
        <template v-for="(city, indey) in group.cities" :key="indey">
          <van-cell :title="city.cityName" @click="cityClick(city)" />
        </template>
      </template>
    </van-index-bar>

    <!-- <template v-for="(group, index) in groupData.cities" :key="index">
      <h2>标题{{ group.group }}</h2>
      <div class="list">
        <template v-for="(city, indey) in group.cities" :key="indey">
          <div class="city">
            {{ city.cityName }}
          </div>
        </template>
      </div>
    </template> -->
  </div>
</template>

<script setup>

import useCityStore from "@/stores/modules/city"
import { computed } from "vue"
import { useRouter } from "vue-router"

// 定义props
const props = defineProps({
  groupData: {
    type: Object,
    default: () => ({})
  }
})

// 动态的索引
const indexList = computed(() => {
  const list = props.groupData.cities.map(item => item.group)
  list.unshift("#")
  return list
})

// 监听城市的点击
const router = useRouter()
const cityStore = useCityStore()
const cityClick = (city) => {
  // 选中当前城市, 并传递给上一级 (1. 中央事件总线 2. store共享数据)
  cityStore.currentCity = city

  // 返回上一级
  router.back()
}


</script>

<style lang="less" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 10px;
  padding-right: 25px;

  .city {
    width: 70px;
    height: 28px;
    color: #000;
    text-align: center;
    line-height: 28px;
    background: #fff4ec;
    border-radius: 12px;
    margin: 6px 0;
  }
}
</style>