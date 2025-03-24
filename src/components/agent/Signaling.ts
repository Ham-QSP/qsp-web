export class AgentDetail {
  name = ""
  id = ""
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
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  FAILED = "FAILED"
}



