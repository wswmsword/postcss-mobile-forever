<template>
  <div class="content">
    <div class="title">热门精选</div>
    <div class="list">
      <template v-for="item in houseList" :key="item.data.houseId">
        <house-item-v3 
          v-if="item.discoveryContentType === 3"
          :item-data="item.data"
          @click="itemClick(item.data)"
        />
        <house-item-v9 
          v-else-if="item.discoveryContentType === 9"
          :item-data="item.data"
          @click="itemClick(item.data)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import useHomeStore from "@/stores/modules/home";
import HouseItemV3 from '@/components/house-item-v3/house-item-v3.vue';
import HouseItemV9 from '@/components/house-item-v9/house-item-v9.vue';
import router from "@/router";


const homeStore = useHomeStore()
const { houseList } = storeToRefs(homeStore)

const itemClick = (item) => {
  // 跳转到详情页
  router.push("/detail/" + item.houseId)
}
</script>

<style lang="less" scoped>

.content {
  padding: 10px;

  .title {
    font-size: 22px;
    padding: 10px;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
  }
}

</style>