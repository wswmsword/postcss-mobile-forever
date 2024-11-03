<template>
  <div class="app">
    <router-view v-slot="props">
      <!-- name属性 -->
      <keep-alive include="home">
        <component :is="props.Component"></component>
      </keep-alive>
    </router-view>
    <!-- 隐藏tabbar 1. 借助route的meta属性 -->
    <!-- <tab-bar v-if="!route.meta.hideTabBar" /> -->
    
    <!-- 隐藏tabbar 2. 借助CSS的z-index -->
    <tab-bar />
    <loading />
  </div>
</template>

<script setup>

import TabBar from '@/components/tab-bar/tab-bar.vue'
import loading from '@/components/loading/loading.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

</script>

<style scoped>

</style>
