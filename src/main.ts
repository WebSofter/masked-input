import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.scss'
import { vMaska } from "maska"
const app = createApp(App).directive("maska", vMaska)
app.mount('#app')
