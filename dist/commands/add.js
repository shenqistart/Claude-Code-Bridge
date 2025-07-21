"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = addCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function addCommand(name, apiKey, options = {}) {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装');
            logger_1.log.info('运行 `ccb install` 先安装 Claude Code');
            process.exit(1);
        }
        const existingProvider = await manager_1.ConfigManager.getProvider(name);
        if (existingProvider || name === 'Anthropic') {
            const { overwrite } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: `提供商 "${name}" 已存在，是否覆盖配置？`,
                    default: false,
                },
            ]);
            if (!overwrite) {
                logger_1.log.info('操作已取消');
                return;
            }
        }
        let baseUrl = options.baseUrl;
        if (!baseUrl && name !== 'Anthropic') {
            const { inputBaseUrl } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'inputBaseUrl',
                    message: `输入 ${name} 的基础 URL (留空则无需自定义 URL):`,
                },
            ]);
            baseUrl = inputBaseUrl || undefined;
        }
        if (name === 'Anthropic') {
            await manager_1.ConfigManager.updateEnvironmentVariables({
                name: 'Anthropic',
                apiKey,
            });
            logger_1.log.success(`Anthropic API 配置已更新`);
            return;
        }
        await manager_1.ConfigManager.addProvider({
            name,
            apiKey,
            baseUrl,
        });
        logger_1.log.success(`提供商 "${name}" 添加成功`);
        logger_1.log.info(`运行 "ccb use ${name}" 切换到此提供商`);
    }
    catch (error) {
        logger_1.log.error(`添加提供商失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=add.js.map