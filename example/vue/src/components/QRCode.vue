<template>
  <div class="qrcode">
    <span class="decorate1"></span>
    <span class="decorate2"></span>
    <span class="decorate3"></span>
    <div class="text">
      <span class="scan">SCAN</span>
      <span class="me">ME</span>
    </div>
  </div>  
</template>

<style scoped>
.qrcode {
  width: 237.5px;
  height: 237.5px;
  border-radius: 10px;
  background-color: rgb(230, 210, 153);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(164, 144, 127);
  font-weight: bold;
  position: relative;
}

.text {
  font-size: 22px;
  background-color: white;
  width: 79px;
  height: 79px;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan {
  text-align: center;
  font-weight: bold;
  line-height: 22px;
}
.me {
  text-align: center;
  font-size: 19px;
}

.decorate1, .decorate2, .decorate3 {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 7px;
  background-color: rgb(164, 144, 127);
}

.decorate1 {
  top: 9px;
  left: 9px;
}

.decorate2 {
  top: 9px;
  right: 9px;
}

.decorate3 {
  bottom: 9px;
  left: 9px;
}
</style>