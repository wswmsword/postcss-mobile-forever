<script setup>
</script>

<template>
  <div class="card-back">
    <div class="content"></div>
  </div>
</template>

<style scoped>
.card-back {
  width: 192px;
  height: 344px;
  border-radius: 8px;
  background-color: rgb(219, 191, 139);
  position: relative;
}

.content {
  width: 77px;
  height: 77px;
  border-radius: 50%;
  background-color: rgb(182, 151, 101);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
