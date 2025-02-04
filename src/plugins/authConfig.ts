import {LogLevel, PublicClientApplication} from '@azure/msal-browser';

export const msalInstance = new PublicClientApplication( buildConfigOld());

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
};



function buildConfigOld() {

  return {
    auth: {
      clientId: '03bcfff7-678b-4d47-95c5-fce4f02520eb',
      authority: 'https://login.microsoftonline.com/830fa23d-86e7-4174-9e22-77ebd8ff4c3b',
      redirectUri: 'http://localhost:3000', // Must be registered as a SPA redirectURI on your app registration
      postLogoutRedirectUri: '/' // Must be registered as a SPA redirectURI on your app registration
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

async function buildConfig() {
  const envConfig = await loadEnvConfig()

  return {
    auth: {
      clientId: envConfig.oauth2ClientId,
      authority: envConfig.oauth2Authority,
      redirectUri: envConfig.portalUrl,
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
