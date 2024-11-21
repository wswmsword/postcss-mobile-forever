import type { App } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import '@vant/touch-emulator'

function install(app: App) {
  app.use(Vant)
}

export default { install }
