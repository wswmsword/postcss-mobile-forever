// 该文件为系统默认配置，请勿修改！！！

const globalSettingsDefault: RecursiveRequired<Settings.all> = {
  app: {
    colorScheme: 'light',
    enableMournMode: false,
    enableColorAmblyopiaMode: false,
    enablePermission: false,
    enableProgress: true,
    enableDynamicTitle: false,
    enableBackTop: true,
  },
  navbar: {
    enable: false,
  },
  tabbar: {
    enable: false,
    list: [],
  },
  copyright: {
    enable: false,
    dates: '',
    company: '',
    website: '',
    beian: '',
  },
}

export default globalSettingsDefault
