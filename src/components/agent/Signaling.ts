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

export class AgentDetail {
  name = ""
  id = ""
  description= ""
  version = ""
  type = ""
}

export class AgentConnection {
  agent: AgentDetail | null = null;
  state: ConnectionState = ConnectionState.NOT_CONNECTED;
}

export enum ConnectionState {
  NOT_CONNECTED = "NOT_CONNECTED",
  INIT = "INIT",
  SIGNALING = "SIGNALING",
  SESSION_EXCHANGE = "SESSION_EXCHANGE",
  CONNECTED = "CONNECTED",
  FAILED = "FAILED",
  DISCONNECTING = "DISCONNECTING",
}



