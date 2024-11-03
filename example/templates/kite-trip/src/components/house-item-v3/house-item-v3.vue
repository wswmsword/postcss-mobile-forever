<template>
  <div class="house-item">
    <div class="item-inner">
      <div class="cover">
        <img :src="itemData.image.url" alt="">
      </div>
      <div class="info">
        <div class="location">
          <img src="@/assets/img/home/location.png">
          <span>{{ itemData.location }}</span>
        </div>
        <div class="name">{{ itemData.houseName }}</div>
        <div class="summary">{{ itemData.summaryText }}</div>
        <div class="price">
          <div class="new">￥{{ itemData.finalPrice }}</div>
          <div class="old">￥{{ itemData.productPrice }}</div>

          <!-- <div class="tip" v-if="itemData?.priceTipBadge">{{ itemData.priceTipBadge.text }}</div> -->
          <div class="tip">{{ itemData?.priceTipBadge?.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  itemData: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style lang="less" scoped>
.house-item {
  width: 50%;

  .item-inner {
    background: #fff;
    border-radius: 6px;
    margin: 5px;
    overflow: hidden;

    .cover {
      img {
        width: 100%;
      }
    }

    .info {
      color: #666;
      font-size: 12px;
      padding: 8px 10px;
    }

    .location {
      display: flex;
      align-items: center;
      img {
        width: 12px;
        height: 12px;
      }

      .text {
        color: #666;
        font-size: 12px;
        margin-left: 2px;
      }
    }

    .name {
      color: #333;
      font-size: 14px;
      margin: 5px 0;

      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .price {
      display: flex;
      align-items: flex-start;

      margin: 8px 0;
      .new {
        color: #ff9645;
        font-size: 14px;
      }

      .old {
        color: #999;
        font-size: 12px;
        text-decoration: line-through;
        margin: 0 3px;
      }

      .tip {
        color: #fff;
        background-image: linear-gradient(270deg,#f66,#ff9f9f);
        padding: 0 6px;
        border-radius: 8px;
      }
    }
  }
}
</style>