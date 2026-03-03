import { createApp, toRaw } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'
import './app.css'

const app = createApp(App)
const pinia = createPinia()

// 为 setup store 添加 $reset() 支持
pinia.use(({ store }) => {
  const initialState = JSON.parse(JSON.stringify(toRaw(store.$state)))
  store.$reset = () => {
    store.$patch(($state) => {
      Object.assign($state, JSON.parse(JSON.stringify(initialState)))
    })
  }
})

app.use(pinia)
app.use(router)
app.mount('#app')
