/*
 * @Description:
 * @Date: 2023-05-15 10:35:14
 * @Author: didi
 * @LastEditTime: 2023-05-15 10:40:46
 */
/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "lunar-javascript";
