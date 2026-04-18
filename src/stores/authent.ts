import {defineStore} from 'pinia'
import axios, {type AxiosInstance} from "axios";

class AuthentAccount {
  name: string = ""
}

interface AuthenticationBroadcastMessage {
  action: string;
  code: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  token_type: string;
  expires_in: string;
}

enum LoginState {
  IDLE,
  REDIRECT_START,
  REDIRECT_SUCCESS,
  AUTHENTICATED,
}

export function getCrypto(): Crypto {
  return globalThis.crypto;
}

export function getCryptoSubtle(): SubtleCrypto {
  return getCrypto().subtle;
}

export async function generateCodeVerifier(): Promise<string> {
  const rando = randomCode();
  const encoded = base64URLEncode(rando);
  return encoded;
}

function randomCode(): string {
  let array = new Uint8Array(32);
  array = globalThis.crypto.getRandomValues(array);
  return String.fromCharCode.apply(null, Array.from(array));
}

function base64URLEncode(str: string): string {
  const b64 = btoa(str);
  const encoded = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return encoded;
}

const sha256 = async (str: string): Promise<string> => {
  const hashArray = await getCryptoSubtle().digest(
    {name: "SHA-256"},
    new TextEncoder().encode(str)
  );
  const uIntArray = new Uint8Array(hashArray);
  const numberArray = Array.from(uIntArray);
  const hashString = String.fromCharCode.apply(null, numberArray);
  return urlEncodeB64(btoa(hashString));
};

const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = {"+": "-", "/": "_", "=": ""};
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};

export async function generateChallenge(
  codeVerifierString: string
): Promise<string> {
  const sha = await sha256(codeVerifierString);
  return sha;
}

function decodeJWT(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}

function isTokenValid(accessToken: string): boolean {
  try {
    const decodedToken = decodeJWT(accessToken);

    if (!decodedToken.exp) {
      console.warn("Token does not have an expiration claim");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = decodedToken.exp > currentTime;

    if (!isValid) {
      console.log("Token has expired");
    }

    return isValid;
  } catch (error) {
    console.error("Failed to validate token:", error);
    return false;
  }
}

function validateTokens(tokenResponse: TokenResponse): boolean {
  return isTokenValid(tokenResponse.access_token)
}

export const useAuthentStore = defineStore('authent', {
  state: () => {
    const account = ref<AuthentAccount | null>(null);
    const loginState = ref<LoginState>(LoginState.IDLE);
    const axiosInstance: AxiosInstance = axios.create()
    const codeVerifier = ref<string>("");
    const tokenResponse = ref<TokenResponse | null>(null);

    return {account, loginState, axiosInstance, codeVerifier, tokenResponse};
  },

  actions: {
    async init() {
      console.log("Auth: init");

      this.restoreStorage();

      const bc = new BroadcastChannel("authent_popup");
      bc.onmessage = async (message) => {
        const authMessage: AuthenticationBroadcastMessage = JSON.parse(message.data);
        if (authMessage.action === "AUTHORIZATION_CODE" && this.loginState === LoginState.REDIRECT_START) {
          this.loginState = LoginState.REDIRECT_SUCCESS;
          console.log("Received authorization code: " + authMessage.code);
           this.getTokenFromAuthorizationCode(authMessage.code).then((token) => {
             console.debug("Get Auth response.");
             console.log("Access token:", token.data.access_token);
             this.handleSuccessLoginResponse(token.data);
           })
        } else {
          console.log("Invalid authentication state / message combination. State: " + this.loginState + " Message: " + message.data + "");
          this.loginState = LoginState.IDLE;
        }
      }
    },

    restoreStorage() {
      const storedToken = localStorage.getItem('tokenResponse');
      if (storedToken) {
        try {
          const tokenResponse: TokenResponse = JSON.parse(storedToken);

          if (validateTokens(tokenResponse)) {
            this.handleSuccessLoginResponse(tokenResponse);
          } else {
            console.debug("Stored token is expired or invalid");
            localStorage.removeItem('tokenResponse');
          }
        } catch (error) {
          console.error("Failed to restore token from localStorage:", error);
          localStorage.removeItem('tokenResponse');
        }
      }
    },


    async login() {
      console.log("Auth: login");
      this.loginState = LoginState.REDIRECT_START;
      const windowFeatures = "popup,width=400,height=500";
      const verifier = await generateCodeVerifier();
      const challenge = await generateChallenge(verifier);
      console.log({verifier, challenge});
      this.codeVerifier = verifier;

      const params = new URLSearchParams();
      params.append("client_id", "oidc-client");
      params.append("redirect_uri", "http://localhost:3000/src/assets/login-redirect.html");
      //params.append("audience", auth0ApiAudience);
      params.append("response_type", "code");
      params.append("scope", "openid");
      params.append("code_challenge", challenge);
      params.append("code_challenge_method", "S256");
      params.append("state", "AZERTY");

      const url = new URL(`http://localhost:9000/oauth2/authorize?${params.toString()}`);
      const handle = window.open(
        url.toString(),
        "qsp-login",
        windowFeatures,
      );
      if (!handle) {
        console.log("Auth: login: window not opened");
        //TODO handle error
        this.loginState = LoginState.IDLE;
      }
    },
    handleSuccessLoginResponse(tokenResponse: TokenResponse) {
      this.tokenResponse = tokenResponse;
      const decodedToken = decodeJWT(tokenResponse.access_token);
      this.account = new AuthentAccount();
      this.account.name = decodedToken.sub || '';

      this.loginState = LoginState.AUTHENTICATED;

  // Persist tokenResponse to localStorage
      localStorage.setItem('tokenResponse', JSON.stringify(tokenResponse));
    },

    async logout() {
      console.log("Auth: logout");
      localStorage.removeItem('tokenResponse');
      this.tokenResponse = null;
      this.account = null;
      this.loginState = LoginState.IDLE;
    },

    isAuthenticated() : boolean {
      return this.loginState === LoginState.AUTHENTICATED;
    },

    getTokenFromAuthorizationCode(code: string) : Promise<TokenResponse> {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', 'oidc-client');
      params.append('code_verifier', this.codeVerifier);
      params.append('code', code);
      params.append('redirect_uri', 'http://localhost:3000/src/assets/login-redirect.html');
      return axios.post("http://localhost:9000/oauth2/token", params);
    },

    async acquireOrRefreshToken() {
      return ""
    }
  }
})
