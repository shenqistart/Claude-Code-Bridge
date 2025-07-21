"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommand = updateCommand;
const logger_1 = require("../utils/logger");
const system_1 = require("../utils/system");
const manager_1 = require("../config/manager");
async function updateCommand() {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装');
            logger_1.log.info('运行 `ccb install` 安装 Claude Code');
            process.exit(1);
        }
        logger_1.log.progress('正在更新 Claude Code...');
        try {
            await system_1.SystemUtils.updateGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
            logger_1.log.success('Claude Code 已更新到最新版本');
        }
        catch (error) {
            logger_1.log.error(`更新失败: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }
    catch (error) {
        logger_1.log.error(`更新过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=update.js.map