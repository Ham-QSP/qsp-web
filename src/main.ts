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
import {useAuthentStore} from "@/stores/authent";
import type {AppConfig} from "@/AppConfig";


const app = createApp(App)


fetch("/config.json")
  .then((response) => response.json())
  .then((config: AppConfig) => {
    app.config.globalProperties.config = config

    registerPlugins(app)

    const auth = useAuthentStore();
    auth.init().then(
      () => {
        app.mount('#app')
      });

  })
