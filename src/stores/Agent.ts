import {defineStore} from 'pinia'
import {useAxiosStore} from "@/stores/Axios";
import axios from "axios";
import {type AgentDetail} from "@/components/agent/Signaling";

export const useAgentStore = defineStore('agent', {
  state: () => {
    return {axiosStore: useAxiosStore()}
  },
  actions: {
    getAgents(): Promise<AgentDetail> {
      //return axios.get(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/agents");
      return this.axiosStore.axios.get(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/agents");
    },
    signalClientForWebRTC(signalCommand: ClientSignalCommand): Promise<ClientSignalResponse> {
      return  axios.post(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/signal", signalCommand)
    }
  },

})

export class ClientSignalResponse {
  serverSdp: string = ""
}

export class ClientSignalCommand {
  agentSessionId: string | null = null
  clientSdp: string | null = null
}
