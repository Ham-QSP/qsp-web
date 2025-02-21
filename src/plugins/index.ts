/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'

// Types
import type {App} from 'vue'

import type {AuthenticationResult} from "@azure/msal-browser";
import {EventType} from "@azure/msal-browser";
import {msalPlugin} from "./msalPlugin";
import {authConfig} from "@/plugins/authConfig";

// Account selection logic is app dependent. Adjust as needed for different use cases.
// const accounts = authConfig.publicClientApplication.getAllAccounts();
// if (accounts.length > 0) {
//   authConfig.publicClientApplication.setActiveAccount(accounts[0]);
// }
// authConfig.publicClientApplication.addEventCallback((event) => {
//   if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
//     const payload = event.payload as AuthenticationResult;
//     const account = payload.account;
//     authConfig.publicClientApplication.setActiveAccount(account);
//   }
// });

export function registerPlugins(app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(msalPlugin, authConfig.publicClientApplication);
}
