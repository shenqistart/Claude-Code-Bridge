"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lsCommand = lsCommand;
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function lsCommand() {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装');
            logger_1.log.info('运行 `ccb setup` 先安装和配置 Claude Code');
            return;
        }
        const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
        const providersConfig = await manager_1.ConfigManager.loadProviders();
        console.log('可用提供商:');
        console.log('');
        const isAnthropicCurrent = currentProvider.includes('Anthropic');
        const anthropicPrefix = isAnthropicCurrent ? '→' : ' ';
        console.log(`${anthropicPrefix} Anthropic (官方 API)`);
        for (const [name, config] of Object.entries(providersConfig)) {
            const isCurrentProvider = currentProvider.includes(name);
            const prefix = isCurrentProvider ? '→' : ' ';
            const baseUrlInfo = config.base_url ? ` - ${config.base_url}` : '';
            console.log(`${prefix} ${name}${baseUrlInfo}`);
        }
        console.log('');
        console.log(`当前提供商: ${currentProvider}`);
        console.log('');
        console.log('使用 "ccb use <provider>" 切换提供商');
    }
    catch (error) {
        logger_1.log.error(`列出提供商失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=ls.js.map