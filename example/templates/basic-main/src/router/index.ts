import type { RouteRecordRaw } from 'vue-router/auto'
import path from 'path-browserify'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import setupGuards from './guards'

function resolveRoutePath(basePath?: string, routePath?: string) {
  return basePath ? path.resolve(basePath, routePath ?? '') : routePath ?? ''
}

// 将多层嵌套路由处理成一级
function flatRoutesRecursive(routes: RouteRecordRaw[], baseUrl = '') {
  const result: RouteRecordRaw[] = []
  for (const route of routes) {
    if (route.children) {
      result.push(...flatRoutesRecursive(route.children, resolveRoutePath(baseUrl, route.path)))
    }
    else {
      result.push({
        ...route,
        path: resolveRoutePath(baseUrl, route.path),
      })
    }
  }
  return result
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: flatRoutesRecursive(routes),
})

setupGuards(router)

export default router
