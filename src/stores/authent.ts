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

import {defineStore} from 'pinia'
import axios, {type AxiosInstance, type AxiosResponse} from "axios";

const STORAGE_TOKEN = 'tokenResponse';

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
  console.debug("Auth: Validate token");
  try {
    const decodedToken = decodeJWT(accessToken);

    if (!decodedToken.exp) {
      console.warn("Auth: Token does not have an expiration claim");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = decodedToken.exp > currentTime;

    if (!isValid) {
      console.log("Auth: Token has expired");
    }

    return isValid;
  } catch (error) {
    console.error("Auth: Failed to validate token:", error);
    return false;
  }

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
    authenticationUrl(path: string): string {
      if (!this.config.authenticationServerPrefix) {
        throw new Error("Authentication server prefix is not configured");
      }

      return this.config.authenticationServerPrefix + path;
    },
    loginRedirectUrl(): string {
      if (!this.config.portalUrl) {
        throw new Error("Portal URL is not configured");
      }

      return this.config.portalUrl + "/src/assets/login-redirect.html";
    },
    async init() {
      console.log("Auth: init");

      await this.restoreStorage();

      const bc = new BroadcastChannel("authent_popup");
      bc.onmessage = async (message) => {
        const authMessage: AuthenticationBroadcastMessage = JSON.parse(message.data);
        if (authMessage.action === "AUTHORIZATION_CODE" && this.loginState === LoginState.REDIRECT_START) {
          this.loginState = LoginState.REDIRECT_SUCCESS;
          console.log("Auth: Received authorization code: " + authMessage.code);
           this.getTokenFromAuthorizationCode(authMessage.code).then((token) => {
             console.debug("Auth: Get Auth response.");
             this.handleSuccessTokenResponseAcquisition(token.data);
           })
        } else {
          console.log("Auth: Invalid authentication state / message combination. State: " + this.loginState + " Message: " + message.data + "");
          this.loginState = LoginState.IDLE;
        }
      }
    },

    async restoreStorage() {
      const storedToken = localStorage.getItem(STORAGE_TOKEN);
      if (storedToken) {
        console.debug("Auth: Restoring token from localStorage");
        try {
          const tokenResponse: TokenResponse = JSON.parse(storedToken);

          if (await this.validateOrRefreshToken(tokenResponse)) {
            console.debug("Auth: Token restored successfully");
          } else {
            console.debug("Auth: Stored token is expired or invalid");
            localStorage.removeItem(STORAGE_TOKEN);
          }
        } catch (error) {
          console.error("Auth: Failed to restore token from localStorage:", error);
          localStorage.removeItem(STORAGE_TOKEN);
        }
      }
      else {
        console.debug("Auth: No token found in localStorage");
      }
    },


    async login() {
      console.log("Auth: login");
      this.loginState = LoginState.REDIRECT_START;
      const windowFeatures = "popup,width=400,height=500";
      const verifier = await generateCodeVerifier();
      const challenge = await generateChallenge(verifier);
      this.codeVerifier = verifier;

      const params = new URLSearchParams();
      params.append("client_id", "portal");
      params.append("redirect_uri", this.loginRedirectUrl());
      params.append("response_type", "code");
      params.append("scope", "openid");
      params.append("code_challenge", challenge);
      params.append("code_challenge_method", "S256");
      params.append("state", "AZERTY"); //fixme Use real state

      const url = new URL(this.authenticationUrl(`/oauth2/authorize?${params.toString()}`));
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
    handleSuccessTokenResponseAcquisition(tokenResponse: TokenResponse) {
      this.tokenResponse = tokenResponse;
      const decodedToken = decodeJWT(tokenResponse.access_token);
      this.account = new AuthentAccount();
      this.account.name = decodedToken.sub || '';

      this.loginState = LoginState.AUTHENTICATED;

      localStorage.setItem(STORAGE_TOKEN, JSON.stringify(tokenResponse));
      console.log("Auth: Token acquired");
    },

    async logout() {
      console.log("Auth: logout");
      localStorage.removeItem(STORAGE_TOKEN);
      this.tokenResponse = null;
      this.account = null;
      this.loginState = LoginState.IDLE;
    },

    isAuthenticated() : boolean {
      return this.loginState === LoginState.AUTHENTICATED;
    },

    getTokenFromAuthorizationCode(code: string) : Promise<AxiosResponse<TokenResponse>> {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', 'portal');
      params.append('code_verifier', this.codeVerifier);
      params.append('code', code);
      params.append('redirect_uri', this.loginRedirectUrl());
      return axios.post<TokenResponse>(this.authenticationUrl("/oauth2/token"), params);
    },

    getTokenFromARefreshToken(refreshToken: string) : Promise<AxiosResponse<TokenResponse>> {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', 'portal');
      params.append('refresh_token', refreshToken);
      return axios.post<TokenResponse>(this.authenticationUrl("/oauth2/token"), params);
    },

    async validateOrRefreshToken(tokenResponse: TokenResponse) {
      console.debug("Auth: Validate token or refresh");
      if (tokenResponse != null) {
        let accessTokenValid: boolean = false;
        accessTokenValid = isTokenValid(tokenResponse.access_token);
        if (accessTokenValid) {
          this.handleSuccessTokenResponseAcquisition(tokenResponse)
        }
        else {
          console.debug("Auth: Access token is expired or invalid. Try to refresh token");
          const newTokenResponse = await this.getTokenFromARefreshToken(tokenResponse.refresh_token);
          accessTokenValid = true;
          console.debug("Auth: Refresh token success");
          this.handleSuccessTokenResponseAcquisition(newTokenResponse.data);
        }
        return accessTokenValid;
      }
      return false;
    },

    async acquireOrRefreshToken() {
      if (this.loginState != LoginState.AUTHENTICATED) {
        return null;
      }

      if (this.tokenResponse != null) {
        const hasValidToken = await this.validateOrRefreshToken(this.tokenResponse);
        if (hasValidToken) {
          return this.tokenResponse.access_token;
        }
      }

      console.log("Can't get a valid token. Disconnecting");
      await this.logout();
      return null;
    },
  }
})
