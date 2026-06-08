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
import {create, fromBinary, toBinary} from "@bufbuild/protobuf";
import {
  AgentControlMessageSchema,
  RigAntenna,
  RigVfoFlag,
  TrxFrequencySchema,
  TrxVfoMode,
  type RigFrequencyRange,
  type TrxCapabilities,
} from "@ham-qsp/proto-files";

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

export interface TransceiverFrequencyRange {
  listId: number
  lowerFrequencyHz: bigint
  upperFrequencyHz: bigint
  modes: VfoMode[]
  vfo: RigVfoFlag[]
  antenna: RigAntenna[]
  label?: string
}

export interface TransceiverCapabilities {
  rigModel: number
  modelName: string
  manufacturerName: string
  rxFrequencyRanges: TransceiverFrequencyRange[]
  txFrequencyRanges: TransceiverFrequencyRange[]
}

const vfoModeByTrxMode: Partial<Record<TrxVfoMode, VfoMode>> = {
  [TrxVfoMode.AM]: VfoMode.AM,
  [TrxVfoMode.CW]: VfoMode.CW,
  [TrxVfoMode.USB]: VfoMode.USB,
  [TrxVfoMode.LSB]: VfoMode.LSB,
  [TrxVfoMode.RTTY]: VfoMode.RTTY,
  [TrxVfoMode.FM]: VfoMode.FM,
  [TrxVfoMode.WFM]: VfoMode.WFM,
  [TrxVfoMode.CWR]: VfoMode.CWR,
  [TrxVfoMode.RTTYR]: VfoMode.RTTYR,
  [TrxVfoMode.AMS]: VfoMode.AMS,
  [TrxVfoMode.PKTLSB]: VfoMode.PKTLSB,
  [TrxVfoMode.PKTUSB]: VfoMode.PKTUSB,
  [TrxVfoMode.PKTFM]: VfoMode.PKTFM,
  [TrxVfoMode.ECSSUSB]: VfoMode.ECSSUSB,
  [TrxVfoMode.EXSSLSB]: VfoMode.EXSSLSB,
  [TrxVfoMode.FAX]: VfoMode.FAX,
  [TrxVfoMode.SAM]: VfoMode.SAM,
  [TrxVfoMode.DSB]: VfoMode.DSB,
  [TrxVfoMode.FMN]: VfoMode.FMN,
  [TrxVfoMode.PKTAM]: VfoMode.PKTAM,
  [TrxVfoMode.P25]: VfoMode.P25,
  [TrxVfoMode.DSTAR]: VfoMode.DSTAR,
  [TrxVfoMode.DPMR]: VfoMode.DPMR,
  [TrxVfoMode.NXDNVN]: VfoMode.NXDNVN,
  [TrxVfoMode.NXDN_N]: VfoMode.NXDN_N,
  [TrxVfoMode.DCR]: VfoMode.DCR,
  [TrxVfoMode.AMN]: VfoMode.AMN,
  [TrxVfoMode.PSK]: VfoMode.PSK,
  [TrxVfoMode.PSKR]: VfoMode.PSKR,
  [TrxVfoMode.DD]: VfoMode.DD,
  [TrxVfoMode.C4FM]: VfoMode.C4FM,
  [TrxVfoMode.PKTFMN]: VfoMode.PKTFMN,
  [TrxVfoMode.SPEC]: VfoMode.SPEC,
  [TrxVfoMode.CWN]: VfoMode.CWN,
}

function mapFrequencyRange(range: RigFrequencyRange): TransceiverFrequencyRange {
  return {
    listId: range.listId,
    lowerFrequencyHz: range.lowerFrequencyHz,
    upperFrequencyHz: range.upperFrequencyHz,
    modes: range.modes
      .map(mode => vfoModeByTrxMode[mode])
      .filter((mode): mode is VfoMode => mode !== undefined),
    vfo: [...range.vfo],
    antenna: [...range.antenna],
    label: range.label,
  }
}

function mapTransceiverCapabilities(capabilities: TrxCapabilities): TransceiverCapabilities {
  return {
    rigModel: capabilities.rigModel,
    modelName: capabilities.modelName,
    manufacturerName: capabilities.manufacturerName,
    rxFrequencyRanges: capabilities.rxFrequencyRanges.map(mapFrequencyRange),
    txFrequencyRanges: capabilities.txFrequencyRanges.map(mapFrequencyRange),
  }
}

export const useAgentControlStore = defineStore('agentControl', {
  state: () => {
    const dataChannel = ref<RTCDataChannel | null>(null)
    const vfoState = ref<VfoState | null>(null)
    const transceiverCapabilities = ref<TransceiverCapabilities | null>(null)
    return {dataChannel: dataChannel, vfoState: vfoState, transceiverCapabilities: transceiverCapabilities}
  },
  actions: {
    registerDataChannel(dataChannel: RTCDataChannel) {
      this.dataChannel = dataChannel;
      this.vfoState = {frequency: 0,
        mode: VfoMode.AM,
      };
      this.transceiverCapabilities = null;

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
      this.transceiverCapabilities = null;
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
        else if (transceiverMessage.case === "trxCapabilities") {
          this.transceiverCapabilities = mapTransceiverCapabilities(transceiverMessage.value);
          console.log("Capabilities: {}", this.transceiverCapabilities);
        }
      }
    },
    setFrequency(frequency: number) {
      if (this.dataChannel === null) {
        console.warn("Cannot set frequency: no WebRTC data channel registered");
        return;
      }

      if (this.dataChannel.readyState !== "open") {
        console.warn("Cannot set frequency: WebRTC data channel is not open");
        return;
      }

      const trxFrequency = create(TrxFrequencySchema, {
        vfoId: 0,
        frequency: BigInt(frequency),
      });

      const frequencyMessage = create(AgentControlMessageSchema, {
        message: {
          case: "transceiver",
          value: {
            transceiverMessage: {
              case: "frequencyMessage",
              value: trxFrequency,
            },
          },
        },
      });

      this.dataChannel.send(toBinary(AgentControlMessageSchema, frequencyMessage));
    },
    increaseFrequency(increment: number) {
      if (this.vfoState === null) {
        console.warn("Cannot increase frequency: VFO state is undefined");
        return;
      }
      const newFrequency = Number(this.vfoState.frequency + increment);
      this.setFrequency(newFrequency);
      this.vfoState.frequency = newFrequency;
    },
  },
})
