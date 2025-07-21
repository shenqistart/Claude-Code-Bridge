"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ConfigManager {
    static async ensureClaudeDir() {
        await fs.ensureDir(ConfigManager.CLAUDE_DIR);
    }
    static async ensureProvidersFile() {
        await this.ensureClaudeDir();
        if (!await fs.pathExists(ConfigManager.PROVIDERS_FILE)) {
            await fs.writeJson(ConfigManager.PROVIDERS_FILE, {});
        }
    }
    static async loadProviders() {
        await this.ensureProvidersFile();
        return fs.readJson(ConfigManager.PROVIDERS_FILE);
    }
    static async saveProviders(providers) {
        await this.ensureProvidersFile();
        await fs.writeJson(ConfigManager.PROVIDERS_FILE, providers, { spaces: 2 });
    }
    static async addProvider(provider) {
        const providers = await this.loadProviders();
        providers[provider.name] = {
            api_key: provider.apiKey,
        };
        if (provider.baseUrl) {
            providers[provider.name].base_url = provider.baseUrl;
        }
        await this.saveProviders(providers);
    }
    static async removeProvider(providerName) {
        const providers = await this.loadProviders();
        if (providers[providerName]) {
            delete providers[providerName];
            await this.saveProviders(providers);
            return true;
        }
        return false;
    }
    static async getProvider(providerName) {
        if (providerName === 'Anthropic') {
            return null;
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
    static async listProviders() {
        const providers = await this.loadProviders();
        return ['Anthropic', ...Object.keys(providers)];
    }
    static async loadClaudeConfig() {
        if (await fs.pathExists(ConfigManager.CLAUDE_CONFIG_FILE)) {
            return fs.readJson(ConfigManager.CLAUDE_CONFIG_FILE);
        }
        return {};
    }
    static async saveClaudeConfig(config) {
        await fs.writeJson(ConfigManager.CLAUDE_CONFIG_FILE, config, { spaces: 2 });
    }
    static async setOnboardingComplete() {
        const config = await this.loadClaudeConfig();
        config.hasCompletedOnboarding = true;
        await this.saveClaudeConfig(config);
    }
    static getShellConfigFile() {
        const shell = process.env.SHELL || '';
        if (shell.includes('zsh')) {
            const zshrc = path.join(os.homedir(), '.zshrc');
            if (fs.existsSync(zshrc))
                return zshrc;
        }
        if (shell.includes('bash')) {
            const bashrc = path.join(os.homedir(), '.bashrc');
            if (fs.existsSync(bashrc))
                return bashrc;
            const bashProfile = path.join(os.homedir(), '.bash_profile');
            if (fs.existsSync(bashProfile))
                return bashProfile;
        }
        if (shell.includes('fish')) {
            const fishConfig = path.join(os.homedir(), '.config', 'fish', 'config.fish');
            if (fs.existsSync(fishConfig))
                return fishConfig;
        }
        return path.join(os.homedir(), '.profile');
    }
    static async updateEnvironmentVariables(provider) {
        const configFile = this.getShellConfigFile();
        let content = '';
        try {
            content = await fs.readFile(configFile, 'utf8');
        }
        catch {
            await fs.ensureFile(configFile);
        }
        const lines = content.split('\n');
        const filteredLines = lines.filter(line => !line.includes('ANTHROPIC_API_KEY') &&
            !line.includes('ANTHROPIC_BASE_URL'));
        if (provider) {
            if (configFile.endsWith('config.fish')) {
                filteredLines.push(`set -gx ANTHROPIC_API_KEY "${provider.apiKey}"`);
                if (provider.baseUrl) {
                    filteredLines.push(`set -gx ANTHROPIC_BASE_URL "${provider.baseUrl}"`);
                }
            }
            else {
                filteredLines.push(`export ANTHROPIC_API_KEY="${provider.apiKey}"`);
                if (provider.baseUrl) {
                    filteredLines.push(`export ANTHROPIC_BASE_URL="${provider.baseUrl}"`);
                }
            }
        }
        await fs.writeFile(configFile, filteredLines.join('\n'));
    }
    static async clearEnvironmentVariables() {
        await this.updateEnvironmentVariables(null);
    }
    static async getCurrentProvider() {
        const configFile = this.getShellConfigFile();
        try {
            const content = await fs.readFile(configFile, 'utf8');
            const baseUrlLine = content.split('\n').find(line => line.includes('ANTHROPIC_BASE_URL'));
            if (!baseUrlLine) {
                return 'Anthropic (using official API defaults)';
            }
            const baseUrl = baseUrlLine.match(/"([^"]+)"/)?.[1];
            if (!baseUrl) {
                return 'Unknown provider';
            }
            const providers = await this.loadProviders();
            for (const [name, config] of Object.entries(providers)) {
                if (config.base_url === baseUrl) {
                    return `${name} (${baseUrl})`;
                }
            }
            return `Unknown (${baseUrl})`;
        }
        catch {
            return 'Anthropic (using official API defaults)';
        }
    }
}
exports.ConfigManager = ConfigManager;
ConfigManager.CLAUDE_DIR = path.join(os.homedir(), '.claude');
ConfigManager.PROVIDERS_FILE = path.join(ConfigManager.CLAUDE_DIR, 'providers.json');
ConfigManager.CLAUDE_CONFIG_FILE = path.join(os.homedir(), '.claude.json');
ConfigManager.DEFAULT_PROVIDER_NAME = 'Moonshot AI';
ConfigManager.DEFAULT_BASE_URL = 'https://api.moonshot.cn/anthropic/';
ConfigManager.CLAUDE_PACKAGE = '@anthropic-ai/claude-code';
//# sourceMappingURL=manager.js.map