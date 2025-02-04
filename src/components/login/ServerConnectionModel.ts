
export enum ConnectionState { Disconnected, Connecting, Connected}

export class ServerConnection {
  state = ConnectionState.Disconnected;
  station = "F1ABC";
}
