<script setup>
import HelloWorld from './components/HelloWorld.vue'
import JsxComp from './components/jsx/JsxComp';
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div class="squares">
    <div class="sfc"></div>
    <JsxComp />
  </div>
  <HelloWorld msg="Vite + Vue + JSX" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.squares {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.sfc {
  width: 32px;
  height: 32px;
  border-radius: 3px;
  background-color: forestgreen;
  box-shadow: 0 0 4px -1px #105610;
}
</style>
