import {defineStore} from 'pinia'
import {create, fromBinary, toBinary} from "@bufbuild/protobuf";
import {AgentControlMessageSchema} from "@ham-qsp/proto-files";

export enum VfoMode {
  AM = "AM",
  CW = "CW",
  USB = "USB",
  LSB = "LSB",
  RTTY = "RTTY",
  FM = "FM",
  WFM = "WFM",
  CWR = "CWR",
  RTTYR = "RTTYR",
  AMS = "AMS",
  PKTLSB = "PKTLSB",
  PKTUSB = "PKTUSB",
  PKTFM = "PKTFM",
  ECSSUSB = "ECSSUSB",
  EXSSLSB = "EXSSLSB",
  FAX = "FAX",
  SAM = "SAM",
  DSB = "DSB",
  FMN = "FMN",
  PKTAM = "PKTAM",
  P25 = "P25",
  DSTAR = "DSTAR",
  DPMR = "DPMR",
  NXDNVN = "NXDNVN",
  NXDN_N = "NXDN_N",
  DCR = "DCR",
  AMN = "AMN",
  PSK = "PSK",
  PSKR = "PSKR",
  DD = "DD",
  C4FM = "C4FM",
  PKTFMN = "PKTFMN",
  SPEC = "SPEC",
  CWN = "CWN",
}

export interface VfoState {
  frequency: number
  mode: VfoMode
}

export const useAgentControlStore = defineStore('agentControl', {
  state: () => {
    const dataChannel = ref<RTCDataChannel | null>(null)
    const vfoState = ref<VfoState | null>(null)
    return {dataChannel: dataChannel, vfoState: vfoState}
  },
  actions: {
    registerDataChannel(dataChannel: RTCDataChannel) {
      this.dataChannel = dataChannel;
      this.vfoState = {frequency: 0,
        mode: VfoMode.AM,
      };

      const helloMessage = create(AgentControlMessageSchema, {
        message: {
          case: "agent",
          value: {
            agentMessage: {
              case: "hello",
              value: {
                protocolVersionMajor: 1,
                protocolVersionMinor: 0,
              },
            },
          },
        },
      });

      dataChannel.send(toBinary(AgentControlMessageSchema, helloMessage));
    },
    unregisterDataChannel() {
      this.dataChannel = null;
      this.vfoState = null;
    },
    async messageReceived(message: string | Blob | ArrayBuffer | Uint8Array) {
      if (typeof message === "string") {
        console.warn("Agent control message received as string, expected protobuf bytes:", message);
        return;
      }
      if (this.vfoState === null) {
        console.error("Webrtc message received but vfostate is undefined:");
        return;
      }

      let bytes: Uint8Array;
      if (message instanceof Blob) {
        bytes = new Uint8Array(await message.arrayBuffer());
      } else if (message instanceof ArrayBuffer) {
        bytes = new Uint8Array(message);
      } else {
        bytes = message;
      }

      const protobufMessage = fromBinary(AgentControlMessageSchema, bytes);
      console.debug("Agent control protobuf message received:", protobufMessage);

      if (protobufMessage.message.case === "transceiver") {
        const transceiverMessage = protobufMessage.message.value.transceiverMessage;
        if (transceiverMessage.case === "frequencyMessage") {
          this.vfoState.frequency = Number(transceiverMessage.value.frequency);
        }
      }
    },
  },
})
