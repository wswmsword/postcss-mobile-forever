type RecursiveRequired<T> = {
  [P in keyof T]-?: RecursiveRequired<T[P]>
}
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

declare namespace Settings {
  interface app {
    /**
     * 颜色方案
     * @默认值 `''` 跟随系统
     * @可选值 `'light'` 明亮模式
     * @可选值 `'dark'` 暗黑模式
     */
    colorScheme?: '' | 'light' | 'dark'
    /**
     * 是否开启哀悼模式
     * @默认值 `false`
     */
    enableMournMode?: boolean
    /**
     * 是否开启色弱模式
     * @默认值 `false`
     */
    enableColorAmblyopiaMode?: boolean
    /**
     * 是否开启权限功能
     * @默认值 `false`
     */
    enablePermission?: boolean
    /**
     * 是否开启载入进度条
     * @默认值 `true`
     */
    enableProgress?: boolean
    /**
     * 是否开启动态标题
     * @默认值 `false`
     */
    enableDynamicTitle?: boolean
    /**
     * 是否开启返回顶部按钮
     * @默认值 `true`
     */
    enableBackTop?: boolean
  }
  interface navbar {
    /**
     * 是否启用
     * @默认值 `true`
     */
    enable?: boolean
  }
  interface tabbar {
    /**
     * 是否启用
     * @默认值 `false`
     */
    enable?: boolean
    /**
     * 导航菜单
     */
    list?: {
      path: string
      icon?: string
      activeIcon?: string
      text?: string
    }[]
  }
  interface copyright {
    /**
     * 是否开启底部版权，同时在路由 meta 对象里可以单独设置某个路由是否显示底部版权信息
     * @默认值 `false`
     */
    enable?: boolean
    /**
     * 网站运行日期
     * @默认值 `''`
     */
    dates?: string
    /**
     * 公司名称
     * @默认值 `''`
     */
    company?: string
    /**
     * 网站地址
     * @默认值 `''`
     */
    website?: string
    /**
     * 网站备案号
     * @默认值 `''`
     */
    beian?: string
  }
  interface all {
    /** 应用设置 */
    app?: app
    /** 顶部导航栏 */
    navbar?: navbar
    /** 底部导航栏 */
    tabbar?: tabbar
    /** 底部版权设置 */
    copyright?: copyright
  }
}
