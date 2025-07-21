"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCommand = checkCommand;
const logger_1 = require("../utils/logger");
const system_1 = require("../utils/system");
const manager_1 = require("../config/manager");
async function checkCommand() {
    try {
        logger_1.log.info('检查系统要求和安装状态...\n');
        let allGood = true;
        const nodeCheck = await system_1.SystemUtils.checkNodeVersion();
        if (nodeCheck.isValid) {
            logger_1.log.success(`Node.js 版本 ${nodeCheck.version} 已安装`);
        }
        else {
            if (nodeCheck.version) {
                logger_1.log.error(`Node.js 版本 ${nodeCheck.version} 不符合要求，需要 18 或更高版本`);
            }
            else {
                logger_1.log.error('Node.js 未安装');
            }
            allGood = false;
        }
        const npmExists = await system_1.SystemUtils.checkCommand('npm');
        if (npmExists) {
            const npmVersion = await system_1.SystemUtils.getCommandVersion('npm');
            logger_1.log.success(`npm 版本 ${npmVersion} 已安装`);
        }
        else {
            logger_1.log.error('npm 未安装');
            allGood = false;
        }
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (isClaudeInstalled) {
            logger_1.log.success('Claude Code 已安装');
        }
        else {
            logger_1.log.error('Claude Code 未安装');
            allGood = false;
        }
        console.log('');
        if (allGood) {
            logger_1.log.success('系统状态: 所有要求均已满足，Claude Code 可以正常使用');
            console.log('');
            const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
            logger_1.log.info(`当前提供商: ${currentProvider}`);
            const providers = await manager_1.ConfigManager.listProviders();
            if (providers.length > 1) {
                console.log('\n可用提供商:');
                const providersConfig = await manager_1.ConfigManager.loadProviders();
                console.log('  Anthropic: 使用官方 API 默认设置');
                for (const [name, config] of Object.entries(providersConfig)) {
                    const baseUrlInfo = config.base_url ? ` (${config.base_url})` : '';
                    console.log(`  ${name}:${baseUrlInfo}`);
                }
            }
        }
        else {
            logger_1.log.error('系统状态: 缺少必需的依赖项');
            if (!nodeCheck.isValid) {
                logger_1.log.info('  请安装 Node.js 18 或更高版本');
            }
            if (!npmExists) {
                logger_1.log.info('  请安装 npm');
            }
            if (!isClaudeInstalled) {
                logger_1.log.info('  运行 `ccb install` 安装 Claude Code');
            }
        }
        console.log('');
    }
    catch (error) {
        logger_1.log.error(`检查过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=check.js.map