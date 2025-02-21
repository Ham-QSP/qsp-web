/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import {registerPlugins} from '@/plugins'

// Components
import App from './App.vue'

// Composables
import {createApp} from 'vue'
import {authConfig} from "@/plugins/authConfig";


const app = createApp(App)


fetch("/config.json")
  .then((response) => response.json())
  .then((config) => {
    app.config.globalProperties.config = config
    authConfig.init(app)

    registerPlugins(app)

    app.mount('#app')
  })
