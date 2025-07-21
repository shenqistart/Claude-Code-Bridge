"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCommand = removeCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function removeCommand(provider) {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装');
            logger_1.log.info('运行 `ccb install` 先安装 Claude Code');
            return;
        }
        if (provider === 'Anthropic') {
            logger_1.log.error('不能删除内置的 Anthropic 提供商');
            process.exit(1);
        }
        const providerConfig = await manager_1.ConfigManager.getProvider(provider);
        if (!providerConfig) {
            logger_1.log.error(`提供商 "${provider}" 不存在`);
            logger_1.log.info('运行 `ccb ls` 查看可用的提供商');
            process.exit(1);
        }
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `确认删除提供商 "${provider}"？`,
                default: false,
            },
        ]);
        if (!confirm) {
            logger_1.log.info('操作已取消');
            return;
        }
        const removed = await manager_1.ConfigManager.removeProvider(provider);
        if (removed) {
            logger_1.log.success(`提供商 "${provider}" 删除成功`);
            const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
            if (currentProvider.includes(provider)) {
                logger_1.log.warning('您删除了当前正在使用的提供商');
                logger_1.log.info('请运行 `ccb use <provider>` 切换到其他提供商');
            }
        }
        else {
            logger_1.log.error(`删除提供商 "${provider}" 失败`);
        }
    }
    catch (error) {
        logger_1.log.error(`删除提供商失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=remove.js.map