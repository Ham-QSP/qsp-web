import {defineStore} from 'pinia'
import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
import {useAuthentStore} from "@/stores/authent";

export const useAxiosStore = defineStore('axios', {
  state: () => {
    const authentStore = useAuthentStore();
    const axiosInstance: AxiosInstance = axios.create()
         axiosInstance.interceptors.request.use(
           async (config: InternalAxiosRequestConfig) => {

           const token = await authentStore.acquireOrRefreshToken();

           if (config.headers && token) {
             config.headers.Authorization = `Bearer ${token}`;
           }

           return config;
         })
    return { axios: axiosInstance, authentStore: authentStore }
  },
})

