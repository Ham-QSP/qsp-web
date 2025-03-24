import { defineStore } from 'pinia'
import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
// import {acquireOrRefreshToken} from "@/stores/useMsal";

export const useAxiosStore = defineStore('axios', {
  state: () => {
    const axiosInstance: AxiosInstance = axios.create()
//          axiosInstance.interceptors.request.use(authInterceptor)
    return { axios: axiosInstance }
  },
})

// async function authInterceptor(config: InternalAxiosRequestConfig) {
//   // Do something before request is sent
//   console.log("Interceptor")
//   const token = await acquireOrRefreshToken();
//   console.info("Interceptor with token:" + token)
//   if (config.headers && token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }
