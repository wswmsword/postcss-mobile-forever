<template>
  <div class="section">
    <div class="header">
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="content">
      <slot>
        <h3>默认内容</h3>
      </slot>
    </div>
    <div class="footer">
      <span class="more">{{ moreText }}</span>
      <van-icon name="arrow" />
    </div>
  </div>
</template>

<script setup>

defineProps({
  title: {
    type: String,
    default: "房屋设施"
  },
  moreText: {
    type: String,
    default: "查看全部"
  }
})

</script>

<style lang="less" scoped>
.section {
  background-color: #fff;
  border-top: 5px solid #f2f3f4;
  padding: 0 15px;
  margin-top: 12px;

  .header {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #eee;

    .title {
      color: #333;
      font-size: 20px;
    }
  }

  .content {
    padding: 8px 0;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 44px;
    color: #ff9645;
    font-size: 14px;
    font-weight: 600;
    line-height: 44px;
  }
}
</style>