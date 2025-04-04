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
import {authConfig} from "@/plugins/msalConfig";
import {useAuthentStore} from "@/stores/authent";


const app = createApp(App)


fetch("/config.json")
  .then((response) => response.json())
  .then((config) => {
    app.config.globalProperties.config = config
    authConfig.init(app)

    registerPlugins(app)

    const auth = useAuthentStore();
    auth.init().then(
      () => {
        console.debug("Mount app");
        app.mount('#app')
      });

  })
