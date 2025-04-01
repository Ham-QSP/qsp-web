import {defineStore} from 'pinia'
import {authConfig, loginRequest} from "@/plugins/authConfig";
import {
  type AuthenticationResult,
  type EventMessage, EventMessageUtils, EventType,
  InteractionRequiredAuthError,
  InteractionStatus
} from "@azure/msal-browser";

export const useAuthentStore = () => {
  const innerStore = defineStore('authent', {
    state: () => {
      const msalInstance = authConfig.publicClientApplication;
      console.log("useAuthentStore init." + msalInstance);
      const inProgress: InteractionStatus = InteractionStatus.Startup;
      //await msalInstance?.initialize();

      return {msalInstance, inProgress}
    },

    getters: {
      isUserAuthenticated: (state) => {
        const accounts = state.msalInstance.getAllAccounts();

        return accounts.length > 0;
      }
    },

    actions: {
      async init() {
        this.msalInstance.addEventCallback((message: EventMessage) => {
          switch (message.eventType) {
            case EventType.ACCOUNT_ADDED:
            case EventType.ACCOUNT_REMOVED:
            case EventType.LOGIN_SUCCESS:
            case EventType.SSO_SILENT_SUCCESS:
            case EventType.HANDLE_REDIRECT_END:
            case EventType.LOGIN_FAILURE:
            case EventType.SSO_SILENT_FAILURE:
            case EventType.LOGOUT_END:
            case EventType.ACQUIRE_TOKEN_SUCCESS:
            case EventType.ACQUIRE_TOKEN_FAILURE: {
              // const currentAccounts = this.msalInstance.getAllAccounts();
              // if (!accountArraysAreEqual(currentAccounts, state.accounts)) {
              //   state.accounts = currentAccounts;
              // }
              break;
            }
          }

          console.log("Event callback: " + message.eventType);
          const status = EventMessageUtils.getInteractionStatusFromEvent(message, this.inProgress);
          if (status !== null) {
            this.inProgress = status;
            console.log("Interaction status: " + status);
          }
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
        console.log("acquireOrRefreshToken. State: " + this.inProgress + "");
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

  const store = innerStore();
  store.init().then(
    () => {
      console.log("init done");
    });

  return store;
}

