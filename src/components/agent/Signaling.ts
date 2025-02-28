import axios from "axios";

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

export class ClientSignalResponse {
  serverSdp: string = ""
}

export class ClientSignalCommand {
  agentSessionId: string | null = null
  clientSdp: string | null = null
}

export async function getAgents(): Promise<AgentDetail> {
  const response = await axios.get(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/agents")
  return response.data;
}

export async function signal(signalCommand: ClientSignalCommand): Promise<ClientSignalResponse> {
  const response = await axios.post(import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/client/signal", signalCommand)
  return response.data
}
