import {defineStore} from 'pinia'
import {authConfig, loginRequest} from "@/plugins/msalConfig";
import {
  type AuthenticationResult,
  type EventMessage,
  EventType,
  InteractionRequiredAuthError,
  PublicClientApplication
} from "@azure/msal-browser";

export const useAuthentStore = defineStore('authent', {
  state: () => {
    const msalInstance = authConfig.publicClientApplication as PublicClientApplication;
    const isAuthenticated = ref(false);

    return {msalInstance, isAuthenticated}
  },

  actions: {
    async init() {
      this.msalInstance.addEventCallback((message: EventMessage) => {
        switch (message.eventType) {
          case EventType.ACCOUNT_ADDED:
          case EventType.ACCOUNT_REMOVED:
          case EventType.LOGIN_SUCCESS:
            this.isAuthenticated = true;
            break;
          case EventType.SSO_SILENT_SUCCESS:
          case EventType.HANDLE_REDIRECT_END:
            const accounts = this.msalInstance.getAllAccounts();
            const isAuthenticated = accounts.length > 0;
            this.isAuthenticated = isAuthenticated;
            break;
          case EventType.LOGIN_FAILURE:
          case EventType.SSO_SILENT_FAILURE:
          case EventType.LOGOUT_SUCCESS:
            this.isAuthenticated = false;
          case EventType.LOGOUT_END:
            console.log("LOGOUT END")
            break;
          case EventType.ACQUIRE_TOKEN_SUCCESS:
          case EventType.ACQUIRE_TOKEN_FAILURE: {
            // const currentAccounts = this.msalInstance.getAllAccounts();
            // if (!accountArraysAreEqual(currentAccounts, state.accounts)) {
            //   state.accounts = currentAccounts;
            // }
            break;
          }
        }

        console.debug("MSAL Event callback: " + message.eventType);
      });

      await this.msalInstance.initialize();
      await this.msalInstance.handleRedirectPromise();
    },

    printDiagnose() {
      const accounts = this.msalInstance?.getAllAccounts();
      if (accounts && accounts.length > 0) {

        console.log("Account username" + this.msalInstance?.getAllAccounts()[0].username);
      } else {
        console.log("No account");
      }
    },

    async acquireOrRefreshToken() {
      return this.msalInstance.acquireTokenSilent(loginRequest)
        .catch(async (error: unknown) => {
          if (error instanceof InteractionRequiredAuthError) {
            return this.msalInstance.acquireTokenPopup(loginRequest)
          }
          throw error
        })
        .then((result: AuthenticationResult) => {
          return result.accessToken
        });
    }
  }
})

