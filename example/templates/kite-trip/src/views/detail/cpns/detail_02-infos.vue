<template>
  <div class="infos">
    <div class="name">{{ infosData.houseName }}</div>
    <div class="tags">
      <template v-for="(item, index) in infosData.houseTags" :key="index">
        <span class="item" 
          v-if="item.tagText"
          :style="{ color: item.tagText.color, background: item.tagText.background.color }"
        >
          {{ item.tagText.text }}
        </span>
      </template>
    </div>
    <div class="comment extra">
      <div class="left">
        <span class="score">{{ infosData.commentBrief.overall }}</span>
        <span class="title">{{ infosData.commentBrief.scoreTitle }}</span>
        <span class="brief">{{ infosData.commentBrief.commentBrief }}</span>
      </div>
      <div class="right">
        <div class="count">
          {{ infosData.commentBrief.totalCount }}条评论
          <van-icon name="arrow" />
        </div>
      </div>
    </div>
    <div class="position extra">
      <div class="left address">
        {{ infosData.nearByPosition.address }}
      </div>
      <div class="right">
        地图·周边
        <van-icon name="arrow" />
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  infosData: {
    type: Object,
    default: () => ({})
  }
})

</script>

<style lang="less" scoped>
.infos {
  padding: 16px;
  background-color: #fff;

  .name {
    color: #333;
    font-size: 20px;
    font-weight: 700;
    line-height: 24px;
    text-align: justify;
    margin-bottom: 6px;
    overflow: hidden;
  }

  .tags {
    margin: 10px 0;

    .item {
      font-size: 12px;
      padding: 1px 3px;
      margin: 0 2px;
    }
  }

  .extra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    border-radius: 5px;
    background-color: #f5f7fa;
    padding: 8px 12px;
    margin: 12px 0;

    .right {
      color: #ff9645;
    }
  }

  .comment {
    .score {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .title {
      color: #333;
      font-weight: 700;
      margin: 0 3px;
    }

    .brief {
      color: #666;
    }
  }

  .position {
    .address {
      font-size: 14px;
      font-weight: 700;
      color: #333;
    }
  }
}
</style>