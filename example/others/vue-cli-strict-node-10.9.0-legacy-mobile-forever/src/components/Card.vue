<template>
  <div class="card">
    <div class="content"></div>
  </div>
</template>

<script>
export default {
  name: "Card",
}
</script>

<style scoped>
.card {
  width: 192px;
  height: 344px;
  border-radius: 8px;
  background-color: rgb(219, 191, 139);
  padding-top: 10px;
  box-sizing: border-box;
}

.content {
  width: 180px;
  height: 290px;
  border-radius: 8px;
  background-color: black;
  margin: 0 auto;
}
</style>
