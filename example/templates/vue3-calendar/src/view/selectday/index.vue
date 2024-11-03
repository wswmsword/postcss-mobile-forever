<!--
 * @Description: 
 * @Date: 2023-05-17 11:01:40
 * @Author: didi
 * @LastEditTime: 2023-05-18 16:24:42
-->
<template>
  <div class="selectday">
    <div class="selectday_nav">
      <div class="selectday_nav_back"></div>
      <div class="selectday_nav_date">
        <div class="snd_change">
          <div
            class="snd_change_item"
            @click="yijitype = 1"
            :class="{ selecty: yijitype == 1 }"
          >
            宜
          </div>
          <div
            class="snd_change_item"
            @click="yijitype = 2"
            :class="{ selectj: yijitype == 2 }"
          >
            忌
          </div>
        </div>
      </div>
      <div class="selectday_nav_jin"></div>
    </div>
    <div class="select_day_content">
      <div class="sdc_item" v-for="(item, index) in jirilist" :key="index">
        <div class="sdc_item_title" :class="{ jitil: yijitype == 2 }">
          {{ item.type }}
        </div>
        <div class="sdc_item_cont">
          <div class="sic_it" v-for="d in item.childrens.split(' ')" :key="d">
            <div @click="todetail(d)" :class="{ ji: yijitype == 2 }">
              {{ d }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "vant";
import { ref } from "vue";
import jirilist from "../../utils/yijilist";
import { useRouter } from "vue-router";
const router = useRouter();
const yijitype = ref(1);
const todetail = (d: string) => {
  router.push(`/selectdetail?name=${d}&type=${yijitype.value}`);
};
//返回
const back = () => {
  window.history.go(-1);
};
</script>
<style lang="less">
.selectday {
  padding-top: 40px;
  .selectday_nav {
    font-weight: bolder;
    padding: 8px 10px;
    background: #fff;
    color: #fff;
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
    .selectday_nav_back {
      span {
        font-size: 14px;
      }
      flex: 1;
    }
    .selectday_nav_date {
      flex: 1;
      text-align: center;
      .snd_change {
        border: 1px solid #f77307;
        display: flex;
        color: #000;
        width: 80px;
        margin: 0 auto;
        border-radius: 5px;
        font-size: 14px;
        font-weight: normal;
        padding: 2px;
        box-sizing: border-box;
        .snd_change_item {
          flex: 1;
          text-align: center;
        }
        .selecty {
          background: #f77307;
          color: #fff;
          border-radius: 4px;
        }
        .selectj {
          background: #b2302e;
          color: #fff;
          border-radius: 4px;
        }
      }
    }
    .selectday_nav_jin {
      flex: 1;
      display: flex;
      flex-direction: row-reverse;
    }
  }
  .select_day_content {
    padding: 10px;
    .sdc_item {
      margin-bottom: 10px;
      .sdc_item_title {
        color: #dc7148;
        font-size: 20px;
        font-weight: bolder;
        padding-left: 10px;
      }
      .jitil {
        color: #b2302e;
      }
      .sdc_item_cont {
        display: flex;
        font-size: 16px;
        flex-wrap: wrap;
        .sic_it {
          width: calc(100% / 3);
          text-align: center;

          margin-top: 10px;
          div {
            background: #fef2e8;
            border: 1px solid #fee6d3;
            color: #dc7148;
            padding: 3px;
            box-sizing: border-box;
            width: 80%;
            margin: 0 auto;
            border-radius: 5px;
          }

          .ji {
            background: #f3dfe0;
            border: 1px solid #e7c6c8;
            color: #b2302e;
          }
        }
      }
    }
  }
}
</style>
