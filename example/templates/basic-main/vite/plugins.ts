import path from 'node:path'
import process from 'node:process'
import vueLegacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import boxen from 'boxen'
import picocolors from 'picocolors'
import Unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { loadEnv, type PluginOption } from 'vite'
import Archiver from 'vite-plugin-archiver'
import banner from 'vite-plugin-banner'
import { compression } from 'vite-plugin-compression2'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import VueDevTools from 'vite-plugin-vue-devtools'

export default function createVitePlugins(mode: string, isBuild = false) {
  const viteEnv = loadEnv(mode, process.cwd())
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    VueRouter({
      routesFolder: './src/views',
      dts: './src/types/typed-router.d.ts',
      exclude: ['**/components', '**/_*/**', '**/_*'],
    }),
    vue(),
    vueJsx(),
    vueLegacy({
      renderLegacyChunks: false,
      modernPolyfills: [
        'es.array.at',
      ],
    }),

    // https://github.com/vuejs/devtools-next
    viteEnv.VITE_OPEN_DEVTOOLS === 'true' && VueDevTools(),

    // https://github.com/unplugin/unplugin-auto-import
    autoImport({
      imports: [
        'vue',
        'pinia',
        VueRouterAutoImports,
        {
          'vue-router/auto': ['useLink'],
        },
      ],
      dts: './src/types/auto-imports.d.ts',
      dirs: [
        './src/utils/composables/**',
      ],
    }),

    // https://github.com/unplugin/unplugin-vue-components
    components({
      dirs: [
        'src/components/*',
        'src/ui-kit',
      ],
      deep: false,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
      dts: './src/types/components.d.ts',
    }),

    Unocss(),

    // https://github.com/vbenjs/vite-plugin-svg-icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: isBuild,
    }),

    // https://github.com/condorheroblog/vite-plugin-fake-server
    vitePluginFakeServer({
      logger: !isBuild,
      include: 'src/mock',
      infixName: false,
      enableProd: isBuild && viteEnv.VITE_BUILD_MOCK === 'true',
    }),

    // https://github.com/nonzzz/vite-plugin-compression
    viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('gzip') && compression(),
    viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('brotli') && compression({
      exclude: [/\.(br)$/, /\.(gz)$/],
      algorithm: 'brotliCompress',
    }),

    viteEnv.VITE_BUILD_ARCHIVE && Archiver({
      archiveType: viteEnv.VITE_BUILD_ARCHIVE,
    }),

    // https://github.com/unplugin/unplugin-turbo-console
    TurboConsole(),

    // https://github.com/chengpeiquan/vite-plugin-banner
    banner(`
/**
 * 由 Fantastic-mobile 提供技术支持
 * Powered by Fantastic-mobile
 * https://fantastic-mobile.hurui.me/
 */
    `),

    {
      name: 'vite-plugin-debug-plugin',
      transform: (code, id) => {
        if (/src\/main.ts$/.test(id)) {
          if (viteEnv.VITE_APP_DEBUG_TOOL === 'eruda') {
            code = code.concat(`
              import eruda from 'eruda'
              eruda.init()
            `)
          }
          else if (viteEnv.VITE_APP_DEBUG_TOOL === 'vconsole') {
            code = code.concat(`
              import VConsole from 'vconsole'
              new VConsole()
            `)
          }
          return {
            code,
            map: null,
          }
        }
      },
    },

    {
      name: 'appInfo',
      apply: 'serve',
      async buildStart() {
        const { bold, green, cyan, bgGreen, underline } = picocolors
        // eslint-disable-next-line no-console
        console.log(
          boxen(
            `${bold(green(`由 ${bgGreen('Fantastic-mobile')} 驱动`))}\n\n${underline('https://fantastic-mobile.hurui.me')}\n\n当前使用：${cyan('基础版')}`,
            {
              padding: 1,
              margin: 1,
              borderStyle: 'double',
              textAlignment: 'center',
            },
          ),
        )
      },
    },
  ]
  return vitePlugins
}
