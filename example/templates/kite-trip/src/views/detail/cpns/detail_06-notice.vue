<template>
  <div class="notice">
    <detail-section title="预定须知">
      <div class="notice-inner">
        <template v-for="(item, index) in orderRules" :key="index">
          <div class="item">
            <span class="title">{{ item.title }}</span>
            <span class="intro">{{ item.introduction }}</span>
            <span class="tip" v-if="item.tips">查看说明</span>
          </div>
        </template>
      </div>
    </detail-section>
  </div>
</template>

<script setup>
import DetailSection from "@/components/detail-section/detail-section.vue"

defineProps({
  orderRules: {
    type: Array,
    default: () => []
  }
})

</script>

<style lang="less" scoped>
.notice-inner {
  .item {
    display: flex;
    margin: 10px 0 20px;
    font-size: 12px;

    .title {
      width: 64px;
      color: #666;
    }

    .intro {
      flex: 1;
      color: #333;
    }
  }
}
</style>
