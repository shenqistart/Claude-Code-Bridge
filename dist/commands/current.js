"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentCommand = currentCommand;
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function currentCommand() {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            console.log('Claude Code: 未安装');
            console.log('');
            logger_1.log.info('运行 `ccb setup` 安装和配置 Claude Code');
            return;
        }
        const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
        console.log(`当前提供商: ${currentProvider}`);
    }
    catch (error) {
        logger_1.log.error(`获取当前提供商失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=current.js.map