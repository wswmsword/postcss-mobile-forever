import { hex2rgba } from '@unocss/preset-mini/utils'

export const lightTheme = {
  // 颜色主题
  'color-scheme': 'light',
  // 内置 UI
  '--ui-primary': hex2rgba('#0f0f0f')!.join(' '),
  '--ui-text': hex2rgba('#fcfcfc')!.join(' '),
  // 主体
  '--g-bg': '#f2f2f2',
  '--g-container-bg': '#fff',
  '--g-border-color': '#DCDFE6',
  // 导航栏
  '--g-navbar-bg': '#fff',
  '--g-navbar-color': '#0f0f0f',
  // 标签栏
  '--g-tabbar-bg': '#fff',
  '--g-tabbar-color': '#6f6f6f',
  '--g-tabbar-active-color': '#0f0f0f',
}

export const darkTheme = {
  // 颜色主题
  'color-scheme': 'dark',
  // 内置 UI
  '--ui-primary': hex2rgba('#e5e5e5')!.join(' '),
  '--ui-text': hex2rgba('#242b33')!.join(' '),
  // 主体
  '--g-bg': '#0a0a0a',
  '--g-container-bg': '#141414',
  '--g-border-color': '#15191e',
  // 导航栏
  '--g-navbar-bg': '#141414',
  '--g-navbar-color': '#e5e5e5',
  // 标签栏
  '--g-tabbar-bg': '#141414',
  '--g-tabbar-color': '#6f6f6f',
  '--g-tabbar-active-color': '#e5e5e5',
}
