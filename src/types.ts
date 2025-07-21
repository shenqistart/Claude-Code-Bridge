export interface Provider {
  name: string;
  baseUrl?: string | undefined;
  apiKey: string;
}

export interface ProvidersConfig {
  [key: string]: {
    base_url?: string;
    api_key: string;
  };
}

export interface ClaudeConfig {
  hasCompletedOnboarding?: boolean;
}

export interface InstallOptions {
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  force?: boolean;
}

export interface CommandOptions {
  verbose?: boolean;
  force?: boolean;
}