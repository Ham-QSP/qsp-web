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



