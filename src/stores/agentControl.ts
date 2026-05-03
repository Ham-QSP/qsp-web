import {defineStore} from 'pinia'
import {create, toBinary} from "@bufbuild/protobuf";
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
    return {dataChannel: dataChannel}
  },
  actions: {
    registerDataChannel(dataChannel: RTCDataChannel) {
      this.dataChannel = dataChannel;

      const helloMessage = create(AgentControlMessageSchema, {
        id: 1n,
        responseId: 0n,
        payload: {
          value: {
            case: "hello",
            value: {
              protocolVersionMajor: 0,
              protocolVersionMinor: 1,
            },
          },
        },
      });

      dataChannel.send(toBinary(AgentControlMessageSchema, helloMessage));
    },
    messageReceived(message: string) {
      console.debug("Agent control message received:", message)
    },
  },
})
