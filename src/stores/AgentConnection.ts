import {defineStore} from 'pinia'
import {useAxiosStore} from "@/stores/Axios";
import {AgentConnection, type AgentDetail, ConnectionState} from "@/components/agent/Signaling";
import {QspServerInfo} from "@/components/login/QspServerInfo";

export const useAgentConnectionStore = defineStore('agentConnection', {
  state: () => {
    const agentConnectionState = ref<AgentConnection>(new AgentConnection())
    const peerConnection = ref<RTCPeerConnection | null>(null)

    return {axiosStore: useAxiosStore(), agentConnectionState, peerConnection}
  },
  actions: {
    getAgents(): Promise<AgentDetail[]> {
      return this.axiosStore.axios
        .get<AgentDetail[]>(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/agents")
        .then((response) => response.data);
    },
    async getQspServerInfo(): Promise<QspServerInfo> {
      const response = await this.axiosStore.axios
        .get<QspServerInfo>(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/server/description");
      return response.data;
    },
    connectToAgent(agent: AgentDetail) {
      this.agentConnectionState.agent = agent;
      this.agentConnectionState.state = ConnectionState.INIT;
      console.debug("Connecting to agent " + agent.id);
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });
      this.peerConnection = pc;

      const dataChannel = pc.createDataChannel("qsp-control");
      let dataChannelMessageSent = false;
      const sendDataChannelMessage = () => {
        if (dataChannelMessageSent || dataChannel.readyState !== "open") return;
        dataChannel.send("Hello from qsp-web client");
        dataChannelMessageSent = true;
      };

      dataChannel.onopen = () => {
        console.debug("Data channel open");
        sendDataChannelMessage();
      };

      const _this = this;
      pc.ontrack = function (event) {
        _this.changeConnectionState(ConnectionState.CONNECTED);
        const el: HTMLAudioElement = <HTMLAudioElement>document.createElement(event.track.kind);
        el.srcObject = event.streams[0];
        el.autoplay = true;
        el.controls = false;

        document.getElementById("remoteTracks")?.appendChild(el);
      };

      pc.oniceconnectionstatechange = () => console.log(pc.iceConnectionState);
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          sendDataChannelMessage();
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate === null) {
          this.changeConnectionState(ConnectionState.SIGNALING);

          const signalCommand = {
            agentSessionId: agent.id,
            clientSdp: pc.localDescription?.sdp,
          };
          const signalResponse = this.axiosStore.axios.post(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/signal", signalCommand);
          signalResponse
            .then((response) => {
              this.changeConnectionState(ConnectionState.SESSION_EXCHANGE)
              pc.setRemoteDescription(
                new RTCSessionDescription({
                  sdp: response.data.serverSdp,
                  type: "answer", //FIXME
                })
              )
                .then(() => {}
                )
                .catch((error) => {
                  console.error(error);
                  this.changeConnectionState(ConnectionState.FAILED);
                });
            })
            .catch((error) => {
              console.error(error);
              this.changeConnectionState(ConnectionState.FAILED);
            });
        }
      };

      pc.addTransceiver("audio", {direction: "sendrecv"});

      pc.createOffer()
        .then((d) => pc.setLocalDescription(d))
        .catch((e) => console.log(e));

    },
    changeConnectionState(newState: ConnectionState) {
      this.agentConnectionState.state = newState;
      console.log("New connection state: " + newState);
    },
    disconnectFromAgent() {
      this.changeConnectionState(ConnectionState.DISCONNECTING)

      // Close the peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Remove all audio elements from the DOM
      const remoteTracks = document.getElementById("remoteTracks");
      if (remoteTracks) {
        while (remoteTracks.firstChild) {
          remoteTracks.removeChild(remoteTracks.firstChild);
        }
      }

      // Reset connection state
      this.agentConnectionState.agent = null;
      this.changeConnectionState(ConnectionState.NOT_CONNECTED);
    },
  },

})

export class ClientSignalResponse {
  serverSdp: string = ""
}

export class ClientSignalCommand {
  agentSessionId: string | null = null
  clientSdp: string | null = null
}
