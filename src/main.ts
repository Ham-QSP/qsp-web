/*
    Copyright (C) 2026 Florian MAZEN

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
