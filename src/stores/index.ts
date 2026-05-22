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
