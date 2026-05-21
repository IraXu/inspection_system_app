import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-mobile-vue'
import App from './App.vue'
import router from './router'

// 引入 TDesign 样式
import 'tdesign-mobile-vue/es/style/index.css'
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)

app.mount('#app')
