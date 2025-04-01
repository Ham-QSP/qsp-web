import {defineStore, type Store} from 'pinia'
import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
import {useAuthentStore} from "@/stores/authent";
// import {acquireOrRefreshToken} from "@/stores/useMsal";

export const useAxiosStore = defineStore('axios', {
  state: () => {
    const authentStore = useAuthentStore();
    const axiosInstance: AxiosInstance = axios.create()
         axiosInstance.interceptors.request.use(
           async (config: InternalAxiosRequestConfig) => {
           console.log("Interceptor");

           const token = await authentStore.acquireOrRefreshToken();

           console.info("Interceptor with token:" + token);

           if (config.headers && token) {
             config.headers.Authorization = `Bearer ${token}`;
           }

           // Retourne la configuration modifiée
           return config;
         })
    return { axios: axiosInstance, authentStore: authentStore }
  },
})

