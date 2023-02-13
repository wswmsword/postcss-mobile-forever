<script setup>
import Card from "./components/Card.vue";
import CardBack from "./components/CardBack.vue";
import Item from "./components/Item.vue";
</script>

<template>
  <div class="app-inner-root">
    <div class="top">
      <Card />
      <CardBack />
    </div>
    <div class="title-wrapper">
      <h1 class="title">TAROTCARD</h1>
    </div>
    <div class="content">
      <Item v-for="_ in 12" />
    </div>
  </div>
</template>

<style scoped>
.app-inner-root {
  width: 100%;
  background-color: black;
  min-height: 100vh;
  position: relative;
  padding: 40px 27px;
  box-sizing: border-box;
}

.app-inner-root::before {
  content: "";
  position: absolute;
  width: 696px;
  height: calc(100% - 80px);
  border: 1px solid rgb(252, 227, 160);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 36px;
  pointer-events: none;
}

.top {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 84px;
  height: 521px;
}

.title-wrapper {
  display: flex;
  justify-content: center;
  padding: 44px 0 88px 0;
}

.title {
  /* color: rgb(224, 198, 151); */
  font-size: 58px;
  color: transparent;
  font-family: "Times New Roman", serif;
  letter-spacing: 5px;
  font-weight: bold;
  background-image: linear-gradient(
    to right,
    rgb(166, 144, 127) 0,
    rgb(230, 210, 153) 22%,
    rgb(164, 144, 127) 45%,
    rgb(230, 210, 153) 78%,
    rgb(164, 144, 127) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  margin: 0;
}

.content {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: 50px;
  row-gap: 56px;
  margin: 0 auto;
  padding-bottom: 88px;
}
</style>
