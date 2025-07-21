import { ProvidersConfig, ClaudeConfig, Provider } from '../types';
export declare class ConfigManager {
    private static readonly CLAUDE_DIR;
    private static readonly PROVIDERS_FILE;
    private static readonly CLAUDE_CONFIG_FILE;
    static readonly DEFAULT_PROVIDER_NAME = "Moonshot AI";
    static readonly DEFAULT_BASE_URL = "https://api.moonshot.cn/anthropic/";
    static readonly CLAUDE_PACKAGE = "@anthropic-ai/claude-code";
    static ensureClaudeDir(): Promise<void>;
    static ensureProvidersFile(): Promise<void>;
    static loadProviders(): Promise<ProvidersConfig>;
    static saveProviders(providers: ProvidersConfig): Promise<void>;
    static addProvider(provider: Provider): Promise<void>;
    static removeProvider(providerName: string): Promise<boolean>;
    static getProvider(providerName: string): Promise<Provider | null>;
    static listProviders(): Promise<string[]>;
    static loadClaudeConfig(): Promise<ClaudeConfig>;
    static saveClaudeConfig(config: ClaudeConfig): Promise<void>;
    static setOnboardingComplete(): Promise<void>;
    static getShellConfigFile(): string;
    static updateEnvironmentVariables(provider: Provider | null): Promise<void>;
    static clearEnvironmentVariables(): Promise<void>;
    static getCurrentProvider(): Promise<string>;
}
//# sourceMappingURL=manager.d.ts.map