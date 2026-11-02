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
import {useAxiosStore} from "@/stores/Axios";
import {useAgentConnectionStore} from "@/stores/AgentConnection";
import type {
  AgentUpdate,
  Station,
  StationGrant,
  StationGrantUpdate,
  StationUpdate
} from "@/components/settings/station/Station";
import type {AgentDetail} from "@/components/agent/Agent";

export const useStationsStore = defineStore('stations', {
  state: () => {
    return {axiosStore: useAxiosStore(), agentConnectionStore: useAgentConnectionStore()}
  },
  actions: {
    async getStations(): Promise<Station[]> {
      return this.axiosStore.axios
        .get<Station[]>(this.agentConnectionStore.signalingUrl("/station"))
        .then((response) => response.data);
    },
    async getStation(id: string): Promise<Station> {
      return this.axiosStore.axios
        .get<Station>(this.agentConnectionStore.signalingUrl(`/station/${id}`))
        .then((response) => response.data);
    },
    async updateStation(id: string, request: StationUpdate): Promise<Station> {
      return this.axiosStore.axios
        .put<Station>(this.agentConnectionStore.signalingUrl(`/station/${id}`), request)
        .then((response) => response.data);
    },
    async getStationGrants(stationId: string): Promise<StationGrant[]> {
      return this.axiosStore.axios
        .get<StationGrant[]>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/grant`))
        .then((response) => response.data);
    },
    async createStationGrant(stationId: string, request: StationGrantUpdate): Promise<StationGrant> {
      return this.axiosStore.axios
        .post<StationGrant>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/grant`), request)
        .then((response) => response.data);
    },
    async updateStationGrant(stationId: string, grantId: string, request: StationGrantUpdate): Promise<StationGrant> {
      return this.axiosStore.axios
        .put<StationGrant>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/grant/${grantId}`), request)
        .then((response) => response.data);
    },
    async deleteStationGrant(stationId: string, grantId: string): Promise<void> {
      await this.axiosStore.axios
        .delete(this.agentConnectionStore.signalingUrl(`/station/${stationId}/grant/${grantId}`));
    },
    async getStationAgents(stationId: string): Promise<AgentDetail[]> {
      return this.axiosStore.axios
        .get<AgentDetail[]>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent`))
        .then((response) => response.data);
    },
    async createStationAgent(stationId: string, request: AgentUpdate): Promise<AgentDetail> {
      return this.axiosStore.axios
        .post<AgentDetail>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent`), request)
        .then((response) => response.data);
    },
    async updateStationAgent(stationId: string, agentId: string, request: AgentUpdate): Promise<AgentDetail> {
      return this.axiosStore.axios
        .put<AgentDetail>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent/${agentId}`), request)
        .then((response) => response.data);
    },
    async generateStationAgentSecret(stationId: string, agentId: string): Promise<AgentDetail> {
      return this.axiosStore.axios
        .get<AgentDetail>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent/${agentId}/generate-secret`))
        .then((response) => response.data);
    },
    async deleteStationAgent(stationId: string, agentId: string): Promise<void> {
      await this.axiosStore.axios
        .delete(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent/${agentId}`));
    },
  },
})
