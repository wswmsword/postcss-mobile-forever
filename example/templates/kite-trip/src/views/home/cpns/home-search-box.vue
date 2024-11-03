<template>
  <div class="search-box">
    <!-- 位置信息 -->
    <div class="location bottom-gray-line">
      <div class="city" @click="cityClick">{{ currentCity.cityName }}</div>
      <div class="position" @click="positionClick">
        <span class="text">我的位置</span>
        <img src="@/assets/img/home/icon_location.png">
      </div>
    </div>

    <!-- 日期范围 -->
    <div class="section date-range bottom-gray-line" @click="showCalender = true">
      <div class="start">
        <div class="date">
          <span class="tip">入住</span>
          <span class="time">{{ startDateStr }}</span>
        </div>
      </div>
      <div class="stay">共{{ stayCount }}晚</div>
      <div class="end">
        <div class="date">
          <span class="tip">离店</span>
          <span class="time">{{ endDateStr }}</span>
        </div>
      </div>
    </div>
    <van-calendar 
      v-model:show="showCalender"
      type="range"
      color="#ff9854"
      :round="false"
      :formatter="formatter"
      @confirm="onConfirm"
    />

    <!-- 价格/人数选择 -->
    <div class="section price-counter bottom-gray-line">
      <div class="start">价格不限</div>
      <div class="end">人数不限</div>
    </div>
    <!-- 关键字 -->
    <div class="section keyword bottom-gray-line">关键字/位置/民宿名</div>

    <!-- 热门建议 -->
    <div class="section hot-suggests">
      <template v-for="(item, index) in hotSuggests" :key="index">
        <div class="suggests"
             :style="{ color: item.tagText.color, background: item.tagText.background.color }"
        >
          {{ item.tagText.text }}
        </div>
      </template>
    </div>

    <!-- 搜索按钮 -->
    <div class="section search-btn" @click="searchClick">
      <div class="btn">开始搜索</div>
    </div>
  </div>
</template>

<script setup>

import useHomeStore from "@/stores/modules/home"
import useCityStore from "@/stores/modules/city"
import useMainStore from "@/stores/modules/main"
import { storeToRefs } from "pinia"
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { formatMonthDay, getDiffDays } from '@/utils/format_date'

const router = useRouter()

// 定义Props
// defineProps({
//   hotSuggests: {
//     type: Array,
//     default: () => []
//   }
// })


// 位置/城市
const cityClick = () => {
  router.push("/city")
}
const positionClick = () => {
  navigator.geolocation.getCurrentPosition(res => {
    console.log("获取位置成功:", res);
  }, err => {
    console.log("获取位置失败", err)
  }, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  })
}
const cityStore = useCityStore()
const { currentCity } = storeToRefs(cityStore)


// 日期范围的处理
// const nowDate = new Date()
// const newDate = new Date().setDate(nowDate.getDate() + 1) // 利用setDate、getdate方法
// const newDate = new Date().getTime() + 24 * 60 * 60 * 1000 // 利用时间戳 + 一天的毫秒数
const mainStore = useMainStore()
const { startDate, endDate } = storeToRefs(mainStore)

const startDateStr = computed(() => formatMonthDay(startDate.value))
const endDateStr = computed(() => formatMonthDay(endDate.value))

const stayCount = ref(getDiffDays(startDate.value, endDate.value))

const showCalender = ref(false)
const onConfirm = (value) => {
  // 1.设置日期
  const selectStartDate = value[0]
  const selectEndDate = value[1]
  mainStore.startDate = selectStartDate
  mainStore.endDate = selectEndDate
  stayCount.value = getDiffDays(selectStartDate, selectEndDate)

  // 2. 关闭日期选择器
  showCalender.value = false
}

const formatter = (day) => {
  if (day.type === 'start') {
    day.bottomInfo = '入住'
  } else if (day.type === 'end') {
    day.bottomInfo = '离店'
  }

  return day
}


// 热门建议
const homeStore = useHomeStore()
const { hotSuggests } = storeToRefs(homeStore)


// 搜索按钮
const searchClick = () => {
  router.push({
    path: "/search",
    query: {
      startDate: startDate.value,
      endDate: endDate.value,
      currentCity: currentCity.value.cityName
    }
  })
}

</script>

<style lang="less" scoped>
.search-box {
  --van-calendar-popup-height: 100%;
}

.location {
  display: flex;
  align-items: center;
  height: 44px;
  margin: 0 20px;

  .city {
    flex: 1;
    color: #333;
    font-size: 15px;
  }

  .position {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 74px;

    .text {
      position: relative;
      top: 2px;
      color: #333;
      font-size: 12px;
    }

    img {
      margin-left: 5px;
      width: 18px;
      height: 18px;
    }
  }
}

.section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  color: #999;
  height: 44px;
  margin: 0 20px;

  .start, .end {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .end {
    justify-content: flex-end;
  }

  .date {
    display: flex;
    flex-direction: column;

    .tip {
      color: #999;
      font-size: 12px;
    }

    .time {
      color: #333;
      font-size: 15px;
      margin-top: 3px;
    }
  }
}

.date-range {
  .stay {
    flex: 1;
    flex-wrap: wrap;
    text-align: center;
    color: #666;
    font-size: 12px;
  }
}

.price-counter {
  .start {
    border-right: 1px solid var(--gray-line);
  }
}

.hot-suggests {
  height: auto;
  margin: 10px 16px;
  .suggests {
    font-size: 12px;
    border-radius: 14px;
    padding: 4px 8px;
    margin: 4px;
  }
}

.search-btn {
  .btn {
    width: 342px;
    height: 38px;
    max-height: 50px;
    color: #fff;
    font-size: 18px;
    line-height: 38px;
    text-align: center;
    border-radius: 20px;
    background-image: var(--theme-linear-gradient);
  }
}
</style>