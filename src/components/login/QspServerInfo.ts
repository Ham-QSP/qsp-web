export class QspServerInfo {
  serverName: string;
  description: string;
  type: string;
  version: string;

  constructor(serverName: string, description: string, type: string, version: string) {
    this.serverName = serverName;
    this.description = description;
    this.type = type;
    this.version = version;
  }
}
