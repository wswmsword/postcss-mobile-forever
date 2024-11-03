import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import 'vant/lib/index.css';
import router from "@/router"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import RouterViewKeepAlive from "router-view-keep-alive";
import kt from 'kitty-ui'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
createApp(App).use(router).use(pinia).use(kt).use(RouterViewKeepAlive).mount('#app')
