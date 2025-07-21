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
exports.uninstallCommand = uninstallCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = require("../utils/logger");
const system_1 = require("../utils/system");
const manager_1 = require("../config/manager");
async function uninstallCommand(options) {
    try {
        let confirm = options.force || false;
        if (!confirm) {
            const { confirmUninstall } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirmUninstall',
                    message: '确认要卸载 Claude Code 并删除所有配置吗？此操作不可撤销。',
                    default: false,
                },
            ]);
            confirm = confirmUninstall;
        }
        if (!confirm) {
            logger_1.log.info('卸载操作已取消');
            return;
        }
        let hasErrors = false;
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (isClaudeInstalled) {
            logger_1.log.progress('正在卸载 Claude Code...');
            try {
                await system_1.SystemUtils.uninstallGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
                logger_1.log.success('Claude Code 卸载成功');
            }
            catch (error) {
                logger_1.log.error(`Claude Code 卸载失败: ${error instanceof Error ? error.message : String(error)}`);
                hasErrors = true;
            }
        }
        else {
            logger_1.log.info('Claude Code 当前未安装');
        }
        logger_1.log.progress('正在从 shell 配置中删除环境变量...');
        try {
            await manager_1.ConfigManager.clearEnvironmentVariables();
            logger_1.log.success('环境变量删除成功');
        }
        catch (error) {
            logger_1.log.warning('无法删除所有环境变量，请手动检查 shell 配置文件');
            hasErrors = true;
        }
        const claudeDir = path.join(os.homedir(), '.claude');
        if (await fs.pathExists(claudeDir)) {
            logger_1.log.progress('正在删除 Claude 配置目录...');
            try {
                await fs.remove(claudeDir);
                logger_1.log.success(`已删除 ${claudeDir} 目录`);
            }
            catch (error) {
                logger_1.log.error(`无法删除 ${claudeDir} 目录: ${error instanceof Error ? error.message : String(error)}`);
                hasErrors = true;
            }
        }
        else {
            logger_1.log.info(`Claude 配置目录 ${claudeDir} 不存在`);
        }
        const claudeConfigFile = path.join(os.homedir(), '.claude.json');
        if (await fs.pathExists(claudeConfigFile)) {
            logger_1.log.progress('正在删除 Claude 配置文件...');
            try {
                await fs.remove(claudeConfigFile);
                logger_1.log.success(`已删除 ${claudeConfigFile} 文件`);
            }
            catch (error) {
                logger_1.log.error(`无法删除 ${claudeConfigFile} 文件: ${error instanceof Error ? error.message : String(error)}`);
                hasErrors = true;
            }
        }
        else {
            logger_1.log.info(`Claude 配置文件 ${claudeConfigFile} 不存在`);
        }
        if (hasErrors) {
            logger_1.log.warning('Claude Code 卸载完成，但有一些警告');
            logger_1.log.info('某些文件或配置可能需要手动删除');
        }
        else {
            logger_1.log.success('Claude Code 已完全卸载');
        }
        logger_1.log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以完成卸载过程');
    }
    catch (error) {
        logger_1.log.error(`卸载过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
//# sourceMappingURL=uninstall.js.map