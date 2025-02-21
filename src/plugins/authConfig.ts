import {LogLevel, PublicClientApplication} from '@azure/msal-browser';
import type {App} from "vue";
import type {AuthenticationResult} from "@azure/msal-browser";
import {EventType} from "@azure/msal-browser";

//export const msalInstance = new PublicClientApplication( buildPublicClientConfig());

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
};

class AuthConfig {
  publicClientApplication: PublicClientApplication | null = null;

  init(app: App) {
    this.publicClientApplication = new PublicClientApplication(buildPublicClientConfig(
      app.config.globalProperties.config.MSAL_CLIENT_ID,
      app.config.globalProperties.config.MSAL_AUTHORITY,
      app.config.globalProperties.config.MSAL_REDIRECT_URI));

    this.publicClientApplication.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        this.publicClientApplication?.setActiveAccount(account);
      }
    });
  }
}

export const authConfig = new AuthConfig();

function buildPublicClientConfig(clientId: string, authority: string, redirectUri: string) {

  return {
    auth: {
      clientId: clientId,
      authority: authority,
      redirectUri: redirectUri,
      postLogoutRedirectUri: '/'
    },
    cache: {
      cacheLocation: 'localStorage'
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
            default:
              return;
          }
        },
        logLevel: LogLevel.Verbose
      }
    }
  }
}
