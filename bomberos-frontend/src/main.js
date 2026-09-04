import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // <-- Importamos las rutas

const app = createApp(App)

app.use(router) // <-- Le decimos a Vue que use el Router

app.mount('#app')