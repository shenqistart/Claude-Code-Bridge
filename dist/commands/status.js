"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const logger_1 = require("../utils/logger");
const system_1 = require("../utils/system");
const manager_1 = require("../config/manager");
async function statusCommand() {
    try {
        console.log('系统状态检查:\n');
        let allGood = true;
        const nodeCheck = await system_1.SystemUtils.checkNodeVersion();
        if (nodeCheck.isValid) {
            logger_1.log.success(`Node.js ${nodeCheck.version}`);
        }
        else {
            if (nodeCheck.version) {
                logger_1.log.error(`Node.js ${nodeCheck.version} (需要 18+)`);
            }
            else {
                logger_1.log.error('Node.js 未安装');
            }
            allGood = false;
        }
        const npmExists = await system_1.SystemUtils.checkCommand('npm');
        if (npmExists) {
            const npmVersion = await system_1.SystemUtils.getCommandVersion('npm');
            logger_1.log.success(`npm ${npmVersion}`);
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
            logger_1.log.success('所有组件都已正确安装');
            console.log('');
            const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
            console.log(`当前提供商: ${currentProvider}`);
            const providersConfig = await manager_1.ConfigManager.loadProviders();
            const providerCount = Object.keys(providersConfig).length + 1;
            if (providerCount > 1) {
                console.log(`\n配置的提供商数量: ${providerCount}`);
                console.log('运行 "ccb ls" 查看所有提供商');
            }
            console.log('\n✓ Claude Code 已就绪');
        }
        else {
            logger_1.log.warning('发现问题，需要处理:');
            if (!nodeCheck.isValid) {
                console.log('  • 安装 Node.js 18 或更高版本');
            }
            if (!npmExists) {
                console.log('  • 安装 npm');
            }
            if (!isClaudeInstalled) {
                console.log('  • 运行 "ccb setup" 安装 Claude Code');
            }
        }
        console.log('');
    }
    catch (error) {
        logger_1.log.error(`状态检查失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=status.js.map