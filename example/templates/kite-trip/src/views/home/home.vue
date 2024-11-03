<template>
  <div class="home" ref="homeRef">
    <home-nav-bar />
    <div class="banner">
      <img src="@/assets/img/home/banner.webp" alt="">
    </div>
    <home-search-box />
    <home-categories />
    <div v-if="isShowSearchBar" class="search-bar">
      <search-bar />
    </div>
    <home-content />
  </div>
</template>

<script>
export default {
  name: "home"
}
</script>

<script setup>
import { computed, onActivated, ref, watch } from 'vue'

import useHomeStore from '@/stores/modules/home'
import HomeNavBar from './cpns/home-nav-bar.vue'
import HomeSearchBox from './cpns/home-search-box.vue'
import HomeCategories from './cpns/home-categories.vue'
import HomeContent from './cpns/home-content.vue'
import SearchBar from '@/components/search-bar/search-bar.vue'

import useScroll from '@/hooks/useScroll.js'

// import { getHotSuggests } from '@/service'


// 发送网络请求 页面中
// 1. 热门建议
// const hotSuggests = ref([])
// getHotSuggests().then(res => {
//   console.log(res)
//   hotSuggests.value = res.data
// })
// 2. 分类列表
// const categories = ref([])

// 发送网络请求 store中
const homeStore = useHomeStore()
homeStore.fetchHotSuggestsData()
homeStore.fetchCategoriesData()
homeStore.fetchHouseListData()

// 监听window窗口的滚动
// 1. 当我们离开页面时，我们移除监听
// 2. 如果别的页面也进行类似的监听，会编写重复代码
// useScroll(() => {
//   homeStore.fetchHouseListData()
// })
const homeRef = ref()
const { isReachBottom, scrollTop } = useScroll(homeRef)
watch(isReachBottom, (newValue) => { // 监听到标识符变化的时候，执行js逻辑
  if (newValue) {
    homeStore.fetchHouseListData().then(() => {
      isReachBottom.value = false
    })
  }
})

// 搜索框显示的控制
// const isShowSearchBar = ref(false)
// watch(scrollTop, (newTop) => {
//   isShowSearchBar.value = newTop > 100
// })
const isShowSearchBar = computed(() => { // 定义的响应式数据, 依赖另外一个可响应式的数据
  return scrollTop.value >= 360
})


onActivated(() => {
  homeRef.value?.scrollTo({
    top: scrollTop.value
  })
})

</script>

<style lang="less" scoped>
.home {
  height: 100vh;
  padding-bottom: 50px;
  overflow-y: auto;
  box-sizing: border-box;
}

.banner {
  img {
    width: 100%;
  }
}

.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 45px;
  padding: 16px 16px 10px;
  background: white;
  z-index: 9;
}
</style>