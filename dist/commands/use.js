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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCommand = useCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function useCommand(provider) {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装');
            logger_1.log.info('运行 `ccb setup` 先安装和配置 Claude Code');
            process.exit(1);
        }
        let targetProvider = provider;
        if (!targetProvider) {
            const providers = await manager_1.ConfigManager.listProviders();
            if (providers.length === 1) {
                logger_1.log.warning('没有配置的提供商可以切换');
                logger_1.log.info('运行 `ccb add <name> <api-key>` 添加新的提供商');
                return;
            }
            const { selectedProvider } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'selectedProvider',
                    message: '选择要切换到的提供商:',
                    choices: providers,
                },
            ]);
            targetProvider = selectedProvider;
        }
        if (targetProvider === 'Anthropic') {
            const configFile = manager_1.ConfigManager.getShellConfigFile();
            let hasApiKey = false;
            try {
                const fs = await Promise.resolve().then(() => __importStar(require('fs-extra')));
                const content = await fs.readFile(configFile, 'utf8');
                hasApiKey = content.includes('ANTHROPIC_API_KEY');
            }
            catch {
            }
            if (!hasApiKey) {
                const { apiKey } = await inquirer_1.default.prompt([
                    {
                        type: 'password',
                        name: 'apiKey',
                        message: '输入 Anthropic API 密钥:',
                        validate: (input) => input.trim().length > 0 || 'API 密钥不能为空',
                    },
                ]);
                await manager_1.ConfigManager.updateEnvironmentVariables({
                    name: 'Anthropic',
                    apiKey,
                });
            }
            else {
                const fs = await Promise.resolve().then(() => __importStar(require('fs-extra')));
                const content = await fs.readFile(configFile, 'utf8');
                const lines = content.split('\n');
                let existingApiKey = '';
                for (const line of lines) {
                    if (line.includes('ANTHROPIC_API_KEY')) {
                        const match = line.match(/"([^"]+)"/);
                        if (match) {
                            existingApiKey = match[1];
                            break;
                        }
                    }
                }
                if (existingApiKey) {
                    await manager_1.ConfigManager.updateEnvironmentVariables({
                        name: 'Anthropic',
                        apiKey: existingApiKey,
                    });
                }
            }
            logger_1.log.success('已切换到 Anthropic (官方 API)');
            logger_1.log.info('请重启终端或运行 `source ~/.bashrc` 以使更改生效');
            return;
        }
        if (!targetProvider) {
            logger_1.log.error('没有指定要切换到的提供商');
            return;
        }
        const providerConfig = await manager_1.ConfigManager.getProvider(targetProvider);
        if (!providerConfig) {
            logger_1.log.error(`提供商 "${targetProvider}" 不存在`);
            logger_1.log.info('运行 `ccb ls` 查看可用的提供商');
            process.exit(1);
        }
        await manager_1.ConfigManager.updateEnvironmentVariables(providerConfig);
        logger_1.log.success(`已切换到提供商: ${targetProvider}`);
        logger_1.log.info('请重启终端或运行 `source ~/.bashrc` 以使更改生效');
    }
    catch (error) {
        logger_1.log.error(`切换提供商失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=use.js.map