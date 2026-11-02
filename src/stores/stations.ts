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
import type {Station} from "@/components/settings/station/Station";
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
    async getStationAgents(stationId: string): Promise<AgentDetail[]> {
      return this.axiosStore.axios
        .get<AgentDetail[]>(this.agentConnectionStore.signalingUrl(`/station/${stationId}/agent`))
        .then((response) => response.data);
    },
  },
})
