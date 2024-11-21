import settingsDefault from '@/settings'

const useSettingsStore = defineStore(
  // 唯一ID
  'settings',
  () => {
    const settings = ref(settingsDefault)

    const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const currentColorScheme = ref<Exclude<Settings.app['colorScheme'], ''>>()
    watch(() => settings.value.app.colorScheme, (val) => {
      if (val === '') {
        prefersColorScheme.addEventListener('change', updateTheme)
      }
      else {
        prefersColorScheme.removeEventListener('change', updateTheme)
      }
    }, {
      immediate: true,
    })
    watch(() => settings.value.app.colorScheme, updateTheme, {
      immediate: true,
    })
    function updateTheme() {
      let colorScheme = settings.value.app.colorScheme
      if (colorScheme === '') {
        colorScheme = prefersColorScheme.matches ? 'dark' : 'light'
      }
      currentColorScheme.value = colorScheme
      switch (colorScheme) {
        case 'light':
          document.documentElement.classList.remove('dark')
          break
        case 'dark':
          document.documentElement.classList.add('dark')
          break
      }
    }
    watch([
      () => settings.value.app.enableMournMode,
      () => settings.value.app.enableColorAmblyopiaMode,
    ], (val) => {
      document.documentElement.style.removeProperty('filter')
      if (val[0] && val[1]) {
        document.documentElement.style.setProperty('filter', 'grayscale(100%) invert(80%)')
      }
      else if (val[0]) {
        document.documentElement.style.setProperty('filter', 'grayscale(100%)')
      }
      else if (val[1]) {
        document.documentElement.style.setProperty('filter', 'invert(80%)')
      }
    }, {
      immediate: true,
    })

    const title = ref('')
    // 设置网页标题
    function setTitle(val: string) {
      title.value = val
    }

    return {
      settings,
      currentColorScheme,
      title,
      setTitle,
    }
  },
)

export default useSettingsStore
