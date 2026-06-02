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

// Utilities
import { createPinia } from 'pinia'
import type {AppConfig} from "@/AppConfig";

declare module 'pinia' {
  export interface PiniaCustomProperties {
    config: AppConfig
  }
}

const pinia = createPinia()

pinia.use(({app}) => ({
  config: app.config.globalProperties.config as AppConfig,
}))

export default pinia
