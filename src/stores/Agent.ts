import {defineStore} from 'pinia'
import {useAxiosStore} from "@/stores/Axios";
import {AgentConnection, type AgentDetail, ConnectionState} from "@/components/agent/Signaling";

export const useAgentStore = defineStore('agent', {
  state: () => {
    const agentConnectionState = ref<AgentConnection>(new AgentConnection())

    return {axiosStore: useAxiosStore(), agentConnectionState}
  },
  actions: {
    getAgents(): Promise<AgentDetail[]> {
      return this.axiosStore.axios
        .get<AgentDetail[]>(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/agents")
        .then((response) => response.data);
    },
    connectToAgent(agent: AgentDetail) {
      this.agentConnectionState.agent = agent;
      this.agentConnectionState.state = ConnectionState.INIT;
      console.debug("Connecting to agent " + agent.id);
    },
    signalClientForWebRTC(signalCommand: ClientSignalCommand): Promise<ClientSignalResponse> {
      return this.axiosStore.axios.post(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/signal", signalCommand)
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
