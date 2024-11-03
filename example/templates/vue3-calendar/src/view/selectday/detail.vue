<!--
 * @Description: 
 * @Date: 2023-05-17 14:08:49
 * @Author: didi
 * @LastEditTime: 2023-05-18 16:38:33
-->
<template>
  <div class="detail">
    <div class="detail_nav">
      <div class="detail_nav_back" @click="back"></div>
      <div class="detail_nav_date" :class="{ nav_ji: type == '2' }">
        {{ yijiname }}
      </div>
      <div class="detail_nav_jin"></div>
    </div>
    <div class="detail_top">
      <div class="detail_selectday">
        <div class="detail_selectday_t">
          <div class="dst_startend" @click="showpickerstart = true">
            <span class="dst_start_til">开始</span>
            <span class="dst_start_val"
              >{{ new Date(starttime).getFullYear() }}.{{
                addzero(new Date(starttime).getMonth() + 1)
              }}.{{ addzero(new Date(starttime).getDate()) }}
              {{
                Solar.fromDate(new Date(starttime))
                  .getLunar()
                  .getMonthInChinese()
              }}月{{
                Solar.fromDate(new Date(starttime)).getLunar().getDayInChinese()
              }}</span
            >
            &nbsp;
            <Icon name="arrow-down" />
          </div>
          <div class="dst_startend" @click="showpickerend = true">
            <span class="dst_start_til">结束</span>
            <span class="dst_start_val"
              >{{ new Date(endtime).getFullYear() }}.{{
                addzero(new Date(endtime).getMonth() + 1)
              }}.{{ addzero(new Date(endtime).getDate()) }}
              {{
                Solar.fromDate(new Date(endtime))
                  .getLunar()
                  .getMonthInChinese()
              }}月{{
                Solar.fromDate(new Date(endtime)).getLunar().getDayInChinese()
              }}</span
            >
            &nbsp;
            <Icon name="arrow-down" />
          </div>
        </div>
        <div class="detail_selectday_isweek">
          <Switch
            class="switch_font"
            active-color="#D34B4B"
            @change="getWeekDay"
            v-model="isWeekShow"
          />
          <div class="dsi_text">只看周末</div>
        </div>
      </div>
      <div class="detail_yiji" :class="{ detail_ji: type == '2' }">
        <div class="detail_yiji_name">
          <div class="dyn_inner">
            {{ yijiname }}
          </div>
        </div>
        <div class="detail_yiji_day">
          区间内{{ yijiname }}的日子有{{ daynum }}天
        </div>
        <div class="detail_yiji_info">
          {{ name }}是指{{ todes[name as any] }}
        </div>
      </div>
    </div>
    <div v-for="item in dayins">
      <div
        class="detail_item"
        v-if="!isWeekShow || item.getWeek() == 0 || item.getWeek() == 6"
      >
        <div class="detail_item_later">
          {{
            item.subtract(nowdayins)
              ? `${item.subtract(nowdayins)}天后`
              : "今天"
          }}
        </div>
        <div class="detail_item_card">
          <div class="dic_ym">
            {{ item.getYear() }}.{{ addzero(item.getMonth()) }}
          </div>
          <div class="dic_d">{{ addzero(item.getDay()) }}</div>
          <div class="dic_w">周{{ item.getWeekInChinese() }}</div>
        </div>
        <div class="detail_item_info">
          <div class="dii_lunar">
            {{
              item.getLunar().getMonthInChinese() +
              "月" +
              item.getLunar().getDayInChinese()
            }}
          </div>
          <div class="dii_lymd">
            {{ item.getLunar().getYearInGanZhi() }}年
            {{ item.getLunar().getMonthInGanZhi() }}月
            {{ item.getLunar().getDayInGanZhi() }}日
          </div>
          <div class="dii_zhishen">
            值神: {{ item.getLunar().getDayTianShen() }} &nbsp;&nbsp; 十二神:
            {{ item.getLunar().getZhiXing() }}日
          </div>
          <div class="dii_zhishen">
            星宿:
            {{
              item.getLunar().getXiu() +
              item.getLunar().getZheng() +
              item.getLunar().getAnimal()
            }}
          </div>
        </div>
      </div>
    </div>
    <Overlay
      class="calendar_picker"
      :show="showpickerstart"
      @click="showpickerstart = false"
    >
      <div class="wrapper">
        <datePicker
          v-if="showpickerstart"
          title="选择开始日期"
          class="block"
          @confirm="confirmstart"
        />
      </div>
    </Overlay>
    <Overlay
      class="calendar_picker"
      :show="showpickerend"
      @click="showpickerend = false"
    >
      <div class="wrapper">
        <datePicker
          title="选择结束日期"
          v-if="showpickerend"
          class="block"
          @confirm="confirmend"
        />
      </div>
    </Overlay>
  </div>
</template>

<script lang="ts" setup>
import { Icon, Overlay } from "vant";
import { useRoute } from "vue-router";
import { ref } from "vue";
import { getJiRiList } from "@/utils/getJiRiList";
import addzero from "@/utils/addzero";
import datePicker from "@/components/datepicker.vue";
import { Solar } from "lunar-typescript";
import { Switch } from "vant";
import todes from "@/utils/todes";
const back = () => {
  window.history.go(-1);
};

const nowdayins = Solar.fromDate(new Date());

const isWeekShow = ref(false);
const showpickerstart = ref(false);
const showpickerend = ref(false);
const route = useRoute();
const type: any = route.query.type;
const name = route.query.name;
const yijiname = (type == "1" ? "宜" : "忌") + name;
const starttime = ref(new Date().getTime());
const endtime = ref(new Date().getTime() + 86400000 * 185);
const dayins = ref(
  getJiRiList(type, route.query.name as string, starttime.value, endtime.value)
);
const daynum = ref(dayins.value.length);
const confirmstart = (val: any) => {
  starttime.value = val;
  dayins.value = getJiRiList(
    type,
    route.query.name as string,
    starttime.value,
    endtime.value
  );
};
const confirmend = (val: any) => {
  endtime.value = val;
  dayins.value = getJiRiList(
    type,
    route.query.name as string,
    starttime.value,
    endtime.value
  );
};
const getWeekDay = () => {
  if (isWeekShow.value) {
    const arr = dayins.value.filter((item) => {
      return item.getWeek() == 0 || item.getWeek() == 6;
    });
    daynum.value = arr.length;
  } else {
    daynum.value = dayins.value.length;
  }
};
</script>
<style lang="less">
.detail {
  padding: 50px 10px 10px 10px;
  background: #f5f5f5;
  min-height: 100vh;
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .block {
    width: 80%;
    border-radius: 10px;
    background-color: #fff;
  }
  .detail_nav {
    padding: 8px 10px;
    background: #fff;
    color: #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;
    box-sizing: border-box;
    z-index: 100;
    font-size: 16px;
    left: 0;
    .detail_nav_back {
      span {
        font-size: 14px;
      }
      flex: 1;
    }
    .detail_nav_date {
      flex: 1;
      text-align: center;
      color: #dc7148;
    }
    .nav_ji {
      color: #ca3535;
    }
    .detail_nav_jin {
      flex: 1;
      display: flex;
    }
  }
  .detail_top {
    font-size: 16px;
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    .detail_selectday {
      display: flex;

      .detail_selectday_t {
        flex: 1;
        .dst_startend {
          margin-bottom: 5px;
          .dst_start_til {
            color: #c45751;
          }
          .dst_start_val {
            margin-left: 10px;
            color: #000;
            font-weight: bolder;
          }
        }
      }
      .detail_selectday_isweek {
        width: 80px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        .dsi_text {
          color: #c45751;

          font-size: 14px;
        }
        .switch_font {
          font-size: 20px;
        }
      }
    }
    .detail_yiji {
      border: 1px solid #d99d9a;
      background: #fefdf8;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      margin-top: 15px;
      .detail_yiji_name {
        border: 1px solid #d99d9a;
        padding: 2px;
        border-radius: 5px;
        margin-bottom: 10px;
        display: inline-block;
        .dyn_inner {
          border: 1px solid #d99d9a;
          color: #000;
          border-radius: 5px;
          font-size: 17px;
          padding: 2px 15px;
        }
      }
      .detail_yiji_day {
        font-weight: bolder;
        margin-bottom: 5px;
      }
      .detail_yiji_info {
        color: gray;
        font-size: 15px;
      }
    }
    .detail_ji {
      background: #f3dfe0;
    }
  }
  .detail_item {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    margin-top: 10px;
    position: relative;
    .detail_item_later {
      position: absolute;
      color: #c45751;
      top: 10px;
      right: 10px;
      font-size: 14px;
    }
    .detail_item_card {
      width: 80px;
      border: 1px solid #ca3535;
      color: #ca3535;
      padding: 10px;
      box-sizing: border-box;
      text-align: center;
      border-radius: 10px;
      .dic_ym {
        font-size: 14px;
        margin-bottom: 5px;
      }
      .dic_d {
        font-size: 28px;
        font-weight: bolder;
        margin-bottom: 5px;
      }
      .dic_w {
        font-size: 14px;
      }
    }
    .detail_item_info {
      margin-left: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      flex: 1;
      .dii_lunar {
        font-weight: bolder;
        font-size: 18px;
        color: #000;
      }
      .dii_lymd {
        font-size: 14px;
        font-weight: bolder;
        color: #000;
      }
      .dii_zhishen {
        color: gray;
        font-size: 16px;
      }
    }
  }
}
</style>
