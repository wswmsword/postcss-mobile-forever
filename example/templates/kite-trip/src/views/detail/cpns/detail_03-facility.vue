<template>
  <div class="facility">
    <detail-section title="房屋设施" moreText="查看全部内容">
      <div class="facility-inner">
        <template v-for="(item, index) in houseFacility.houseFacilitys" :key="index">
          <div class="item" v-if="houseFacility.facilitySort.includes(index)">
            <div class="head">
              <img :src="item.icon">
              <div class="text">{{ item.groupName }}</div>
            </div>
            <div class="list">
              <template v-for="(iten, indey) in item.facilitys.slice(0, 4)" :key="indey">
                <div class="iten">
                  <i class="icon_check icon"></i>
                  <span>{{ iten.name }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </detail-section>
  </div>
</template>

<script setup>

import DetailSection from '@/components/detail-section/detail-section.vue'

defineProps({
  houseFacility: {
    type: Object,
    default: () => ({})
  }
})

</script>

<style lang="less" scoped>
.facility-inner {
  padding: 5px 0;
  border-radius: 6px;
  font-size: 12px;
  background-color: #f7f9fb;

  .item {
    display: flex;
    margin: 25px 0;

    .head {
      width: 90px;
      text-align: center;

      img {
        width: 20px;
        height: 20px;
      }

      .text {
        margin-top: 5px;
        color: #000;
      }
    }

    .list {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      .iten {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 50%;
        margin: 4px 0;

        .icon {
          margin: 0 6px;
        }

        .text {
          color: #333;
        }
      }
    }
  }
}
</style>