import settingsDefault from '@/settings.default'
import { defaultsDeep } from 'lodash-es'

const globalSettings: Settings.all = {
  // 请在此处编写或粘贴配置代码
  tabbar: {
    list: [
      {
        path: '/',
        icon: 'i-ic:sharp-home',
        activeIcon: 'i-ic:twotone-home',
        text: '主页',
      },
      {
        path: '/user',
        icon: 'i-ic:baseline-person',
        activeIcon: 'i-ic:twotone-person',
        text: '我的',
      },
    ],
  },
}

export default defaultsDeep(globalSettings, settingsDefault) as RecursiveRequired<Settings.all>
