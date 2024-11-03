/*
 * @Description:
 * @Date: 2023-05-18 15:16:10
 * @Author: didi
 * @LastEditTime: 2023-05-18 15:20:53
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/examples/templates/vue3-calendar',
  server: {
    host: "0.0.0.0",
    port: 8888,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"), // 设置 `@` 指向 `src` 目录
    },
  },
});
