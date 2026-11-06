/*
 * @Author: AloofXu
 * @Date: 2026-04-29 18:32:08
 * @LastEditors: null
 * @LastEditTime: 2026-05-21 11:15:36
 * @FilePath: /app-vue/vite.config.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 不支持 history 路由的服务端回退，构建时复制一份 404.html 作为入口，
// 这样刷新/直接访问子路由时仍能加载应用，再由 vue-router 解析实际路径。
const githubPagesSpaFallback = () => ({
  name: 'github-pages-spa-fallback',
  apply: 'build',
  writeBundle(outputOptions) {
    const outDir = outputOptions.dir || 'dist'
    fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'))
  }
})

export default defineConfig({
  plugins: [
    vue(),
    githubPagesSpaFallback()
  ],
  base: '/inspection_system_app/', //github pages部署需要设置base路径
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
