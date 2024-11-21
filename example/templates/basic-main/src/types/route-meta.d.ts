import type { RouteNamedMap } from 'vue-router/auto-routes'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    cache?: boolean | keyof RouteNamedMap | (keyof RouteNamedMap)[]
    noCache?: keyof RouteNamedMap | (keyof RouteNamedMap)[]
    auth?: boolean | string | string[]
  }
}
