import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { ProvidersConfig, ClaudeConfig, Provider } from '../types';

export class ConfigManager {
  private static readonly CLAUDE_DIR = path.join(os.homedir(), '.claude');
  private static readonly PROVIDERS_FILE = path.join(ConfigManager.CLAUDE_DIR, 'providers.json');
  private static readonly CLAUDE_CONFIG_FILE = path.join(os.homedir(), '.claude.json');
  
  static readonly DEFAULT_PROVIDER_NAME = 'Moonshot AI';
  static readonly DEFAULT_BASE_URL = 'https://api.moonshot.cn/anthropic/';
  static readonly CLAUDE_PACKAGE = '@anthropic-ai/claude-code';

  static async ensureClaudeDir(): Promise<void> {
    await fs.ensureDir(ConfigManager.CLAUDE_DIR);
  }

  static async ensureProvidersFile(): Promise<void> {
    await this.ensureClaudeDir();
    
    if (!await fs.pathExists(ConfigManager.PROVIDERS_FILE)) {
      await fs.writeJson(ConfigManager.PROVIDERS_FILE, {});
    }
  }

  static async loadProviders(): Promise<ProvidersConfig> {
    await this.ensureProvidersFile();
    return fs.readJson(ConfigManager.PROVIDERS_FILE);
  }

  static async saveProviders(providers: ProvidersConfig): Promise<void> {
    await this.ensureProvidersFile();
    await fs.writeJson(ConfigManager.PROVIDERS_FILE, providers, { spaces: 2 });
  }

  static async addProvider(provider: Provider): Promise<void> {
    const providers = await this.loadProviders();
    
    providers[provider.name] = {
      api_key: provider.apiKey,
    };

    if (provider.baseUrl) {
      providers[provider.name].base_url = provider.baseUrl;
    }

    await this.saveProviders(providers);
  }

  static async removeProvider(providerName: string): Promise<boolean> {
    const providers = await this.loadProviders();
    
    if (providers[providerName]) {
      delete providers[providerName];
      await this.saveProviders(providers);
      return true;
    }
    
    return false;
  }

  static async getProvider(providerName: string): Promise<Provider | null> {
    if (providerName === 'Anthropic') {
      // Built-in Anthropic provider
      return null; // Will use default settings
    }

    const providers = await this.loadProviders();
    const providerConfig = providers[providerName];
    
    if (!providerConfig) {
      return null;
    }

    return {
      name: providerName,
      baseUrl: providerConfig.base_url,
      apiKey: providerConfig.api_key,
    };
  }

  static async listProviders(): Promise<string[]> {
    const providers = await this.loadProviders();
    return ['Anthropic', ...Object.keys(providers)];
  }

  static async loadClaudeConfig(): Promise<ClaudeConfig> {
    if (await fs.pathExists(ConfigManager.CLAUDE_CONFIG_FILE)) {
      return fs.readJson(ConfigManager.CLAUDE_CONFIG_FILE);
    }
    return {};
  }

  static async saveClaudeConfig(config: ClaudeConfig): Promise<void> {
    await fs.writeJson(ConfigManager.CLAUDE_CONFIG_FILE, config, { spaces: 2 });
  }

  static async setOnboardingComplete(): Promise<void> {
    const config = await this.loadClaudeConfig();
    config.hasCompletedOnboarding = true;
    await this.saveClaudeConfig(config);
  }

  static getShellConfigFile(): string {
    const shell = process.env.SHELL || '';
    
    if (shell.includes('zsh')) {
      const zshrc = path.join(os.homedir(), '.zshrc');
      if (fs.existsSync(zshrc)) return zshrc;
    }
    
    if (shell.includes('bash')) {
      const bashrc = path.join(os.homedir(), '.bashrc');
      if (fs.existsSync(bashrc)) return bashrc;
      
      const bashProfile = path.join(os.homedir(), '.bash_profile');
      if (fs.existsSync(bashProfile)) return bashProfile;
    }
    
    if (shell.includes('fish')) {
      const fishConfig = path.join(os.homedir(), '.config', 'fish', 'config.fish');
      if (fs.existsSync(fishConfig)) return fishConfig;
    }
    
    // Fallback to .profile
    return path.join(os.homedir(), '.profile');
  }

  static async updateEnvironmentVariables(provider: Provider | null): Promise<void> {
    const configFile = this.getShellConfigFile();
    let content = '';
    
    try {
      content = await fs.readFile(configFile, 'utf8');
    } catch {
      // File doesn't exist, create it
      await fs.ensureFile(configFile);
    }

    // Remove existing Claude-related environment variables
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => 
      !line.includes('ANTHROPIC_API_KEY') && 
      !line.includes('ANTHROPIC_BASE_URL')
    );

    if (provider) {
      // Add new environment variables
      if (configFile.endsWith('config.fish')) {
        // Fish shell syntax
        filteredLines.push(`set -gx ANTHROPIC_API_KEY "${provider.apiKey}"`);
        if (provider.baseUrl) {
          filteredLines.push(`set -gx ANTHROPIC_BASE_URL "${provider.baseUrl}"`);
        }
      } else {
        // Bash/Zsh syntax
        filteredLines.push(`export ANTHROPIC_API_KEY="${provider.apiKey}"`);
        if (provider.baseUrl) {
          filteredLines.push(`export ANTHROPIC_BASE_URL="${provider.baseUrl}"`);
        }
      }
    }

    await fs.writeFile(configFile, filteredLines.join('\n'));
  }

  static async clearEnvironmentVariables(): Promise<void> {
    await this.updateEnvironmentVariables(null);
  }

  static async getCurrentProvider(): Promise<string> {
    const configFile = this.getShellConfigFile();
    
    try {
      const content = await fs.readFile(configFile, 'utf8');
      const baseUrlLine = content.split('\n').find(line => 
        line.includes('ANTHROPIC_BASE_URL')
      );
      
      if (!baseUrlLine) {
        return 'Anthropic (using official API defaults)';
      }
      
      const baseUrl = baseUrlLine.match(/"([^"]+)"/)?.[1];
      if (!baseUrl) {
        return 'Unknown provider';
      }
      
      // Try to find provider by base URL
      const providers = await this.loadProviders();
      for (const [name, config] of Object.entries(providers)) {
        if (config.base_url === baseUrl) {
          return `${name} (${baseUrl})`;
        }
      }
      
      return `Unknown (${baseUrl})`;
    } catch {
      return 'Anthropic (using official API defaults)';
    }
  }
}