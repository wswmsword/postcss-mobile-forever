import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { NavBar, Tabbar, TabbarItem } from "vant";
import "vant/lib/index.css";

const app = createApp(App);
app.use(NavBar);
app.use(Tabbar);
app.use(TabbarItem);
app.mount("#app");