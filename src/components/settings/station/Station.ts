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

import type {InjectionKey, Ref} from 'vue'

export type StationRole = 'OWNER' | 'MEMBER'

export interface Station {
  id: string
  mainQRZ: string
  description: string
  role: StationRole
}

export interface StationUpdate {
  mainQRZ: string
  description: string
}

export interface StationGrant {
  id: string
  station: string
  subject: string
  role: StationRole
}

export interface StationGrantUpdate {
  subject: string
  role: StationRole
}

export interface AgentUpdate {
  displayName: string
}

// Provided by the station layout, so its pages share the loaded station and the user's role.
export const stationKey: InjectionKey<Ref<Station | null>> = Symbol('station')

export function canManageStation(station: Station | null): boolean {
  return station?.role === 'OWNER'
}

export function stationErrorText(error: unknown): string {
  const response = (error as { response?: { status?: number, data?: { message?: string, detail?: string } } }).response
  if (response?.status === 403) return 'You are not allowed to access this station'
  if (response?.status === 404) return 'Station not found'
  return response?.data?.detail ?? response?.data?.message ?? 'Request failed'
}
