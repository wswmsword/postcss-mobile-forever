import Message from 'vue-m-message'

import App from './App.vue'
import router from './router'

import pinia from './store'

import ui from './ui-provider'
import './utils/system.copyright'
import 'vue-m-message/dist/style.css'
import 'overlayscrollbars/overlayscrollbars.css'

// 自定义指令
import directive from '@/utils/directive'

// 加载 svg 图标
import 'virtual:svg-icons-register'

import 'virtual:uno.css'

// 全局样式
import '@/assets/styles/globals.css'

const app = createApp(App)

app.use(Message)
app.use(pinia)
app.use(router)
app.use(ui)
directive(app)

app.mount('#app')
