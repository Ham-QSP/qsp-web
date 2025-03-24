import {defineStore} from 'pinia'
import {authConfig} from "@/plugins/authConfig";

export const useAuthentStore = defineStore('authent', {
  state: () => {
    const msalInstance = authConfig.publicClientApplication;
    console.log("useAuthentStore init." + msalInstance);
    return {msalInstance}
  },

  getters: {
    isUserAuthenticated: (state) => {
      const accounts = state.msalInstance.getAllAccounts();

      return accounts.length > 0;
    }
  },

  actions: {
    printDiagnose() {
      console.log("Account username" + this.msalInstance?.getAllAccounts()[0].username);
    },
  }
})
