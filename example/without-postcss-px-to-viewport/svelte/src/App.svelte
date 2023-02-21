<script>
	import Card from "./Card.svelte";
	import CardBack from "./CardBack.svelte";
	import Item from "./Item.svelte";
  const items = new Array(12).fill();
  const title = "Svelte MobileViewport";
  const letters = ['✨', ' '].concat(title.split(''), '🐰');
</script>

<div class="app-inner-root">
	<div class="top">
    <div class="bg-title-wrapper DEMO_MODE">
      <div class="bg-title">
        {#each letters as letter, i}
          <span style="transform: rotate({i * 5}deg)">{letter}</span>
        {/each}
      </div>
    </div>
    <div class="card-wrapper">
      <Card />
      <CardBack />
    </div>
	</div>
	<div class="title-wrapper">
		<h1 class="title">TAROTCARD</h1>
	</div>
	<div class="content">
		{#each items as _}
			<Item />
		{/each}
	</div>
  <button class="back-to-top">TOP</button>
</div>

<style>
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
  position: relative;
}

.bg-title-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  top: 0;
  height: 170px;
  padding-bottom: 18px;
}

.DEMO_MODE::before {
  content: "✨Portrait✨";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: rgb(166, 144, 127);
  font-size: 26px;
  font-weight: bold;
}

.bg-title {
  color: rgb(166, 144, 127);
  width: 337px;
  transform: rotate(-58.5deg);
  transform-origin: left top;
  position: relative;
  left: -7px;
}

.bg-title span {
  font: 26px Monaco, MonoSpace;
  height: 200px;
  position: absolute;
  width: 20px;
  left: 0;
  top: 0;
  transform-origin: bottom center;
}

.card-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 84px;
}

.title-wrapper {
  display: flex;
  justify-content: center;
  padding: 44px 0 88px 0;
}

.title {
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

.back-to-top {
  padding: 0;
  width: 64px;
  height: 64px;
  border: none;
  background-color: rgb(219, 191, 139);
  box-sizing: border-box;
  border-radius: 18px;
  position: fixed;
  bottom: 58px;
  right: 36px;
  cursor: pointer;
  transition: background-color .3s;
  color: rgb(164, 144, 127);
  font-size: 18px;
  font-weight: bold;
}

.back-to-top:active {
  background-color: rgb(230, 210, 153);
  transition: background-color .1s;
}
</style>