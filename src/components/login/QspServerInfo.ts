export class QspServerInfo {
  name: string;
  description: string;
  type: string;
  version: string;

  constructor(name: string, description: string, type: string, version: string) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.version = version;
  }
}

export async function getQspServerInfo(): Promise<QspServerInfo> {

  // Example implementation to fetch server information from the backend
  const apiUrl = import.meta.env.VITE_SIGNALING_SERVER_PREFIX + "/server"; // Replace with the actual API endpoint

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch server info: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => new QspServerInfo(data.serverName, data.description, data.serverType, data.version))
    .catch((error) => {
      console.error("Error fetching server info:", error);
      throw error;
    });
}
