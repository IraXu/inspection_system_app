import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  BackTop,
  Button,
  Calendar,
  Empty,
  Navbar,
  Popup,
  PullDownRefresh,
  Search,
  Skeleton
} from 'tdesign-mobile-vue'
import App from './App.vue'
import router from './router'
import AppIcon from './components/AppIcon.vue'
import { injectIconSprite } from './components/icon-sprite'

// 只引入主题变量等基础样式，各组件样式由其自身入口按需带入
import 'tdesign-mobile-vue/es/style/index.css'
import 'tdesign-icons-vue-next/esm/style/index.css'
import './styles/index.css'
import './styles/auth.css'
import './styles/device-actions.css'

const app = createApp(App)

// 按需注册实际用到的 TDesign 组件，避免全量注册导致首屏包体过大
const tdesignComponents = [
  BackTop,
  Button,
  Calendar,
  Empty,
  Navbar,
  Popup,
  PullDownRefresh,
  Search,
  Skeleton
]

tdesignComponents.forEach((component) => app.use(component))

// 图标改为本地按需 sprite，避免运行时加载 1MB 的全量图标脚本
injectIconSprite()
app.component('TIcon', AppIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
