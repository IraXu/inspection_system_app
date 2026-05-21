/*
 * @Author: AloofXu
 * @Date: 2026-04-29 18:32:08
 * @LastEditors: null
 * @LastEditTime: 2026-05-21 11:01:13
 * @FilePath: /inspection-system_app/app-vue/vite.config.js
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  base: '/', //github pages部署需要设置base路径
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
