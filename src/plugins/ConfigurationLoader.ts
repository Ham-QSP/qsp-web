class EnvConfig {
  portalUrl: string;
  signalingServerPrefix: string;
  oauth2ClientId: string;
  oauth2Authority: string;

  constructor(portalUrl: string, signalingServerPrefix: string, oauth2ClientId: string, oauth2Authority: string) {
    this.portalUrl = portalUrl;
    this.signalingServerPrefix = signalingServerPrefix;
    this.oauth2ClientId = oauth2ClientId;
    this.oauth2Authority = oauth2Authority;
  }
}

async function loadEnvConfig(): Promise<EnvConfig> {
  try {
    const response = await fetch('src/assets/env.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch environment config: ${response.statusText}`);
    }
    const envData = await response.json();
    console.log('Loaded environment configuration: ', envData, '');
    return new EnvConfig(
      envData.portalUrl,
      envData.signalingServerPrefix,
      envData.oauth2ClientId,
      envData.oauth2Authority
    );
  } catch (error) {
    console.error('Error loading environment configuration:', error);
    throw error;
  }
}

export const configurationLoaderPlugin = {
  install(app, options) {
    console.debug('Installing configuration loader plugin');
    
    // configure l'application
  }
}
