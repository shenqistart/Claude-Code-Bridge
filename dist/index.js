#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const install_1 = require("./commands/install");
const uninstall_1 = require("./commands/uninstall");
const use_1 = require("./commands/use");
const ls_1 = require("./commands/ls");
const current_1 = require("./commands/current");
const status_1 = require("./commands/status");
const update_1 = require("./commands/update");
const add_1 = require("./commands/add");
const remove_1 = require("./commands/remove");
const errors_1 = require("./utils/errors");
const file_logger_1 = require("./utils/file-logger");
const logger_1 = require("./utils/logger");
const program = new commander_1.Command();
program
    .name('ccb')
    .description('Claude Code Bridge - Node.js版本的Claude Code管理工具')
    .version('1.0.0');
program
    .command('install [provider] [api-key]')
    .description('安装Claude Code并配置提供商')
    .option('-u, --base-url <url>', '自定义提供商的基础URL')
    .option('-f, --force', '强制重新安装')
    .action(async (provider, apiKey, options) => {
    try {
        await file_logger_1.Logger.logCommand('install', [provider, apiKey ? '***' : null, options]);
        await (0, install_1.installCommand)(provider, apiKey, options);
    }
    catch (error) {
        await handleError(error, 'install');
    }
});
program
    .command('uninstall')
    .description('卸载Claude Code和所有配置')
    .option('-f, --force', '强制卸载，无需确认')
    .action(async (options) => {
    try {
        await file_logger_1.Logger.logCommand('uninstall', [options]);
        await (0, uninstall_1.uninstallCommand)(options);
    }
    catch (error) {
        await handleError(error, 'uninstall');
    }
});
program
    .command('use [provider]')
    .description('切换到指定的API提供商')
    .action(async (provider) => {
    try {
        await file_logger_1.Logger.logCommand('use', [provider]);
        await (0, use_1.useCommand)(provider);
    }
    catch (error) {
        await handleError(error, 'use');
    }
});
program
    .command('ls')
    .alias('list')
    .description('列出所有已配置的提供商')
    .action(async () => {
    try {
        await file_logger_1.Logger.logCommand('ls', []);
        await (0, ls_1.lsCommand)();
    }
    catch (error) {
        await handleError(error, 'ls');
    }
});
program
    .command('current')
    .description('显示当前激活的提供商')
    .action(async () => {
    try {
        await file_logger_1.Logger.logCommand('current', []);
        await (0, current_1.currentCommand)();
    }
    catch (error) {
        await handleError(error, 'current');
    }
});
program
    .command('add <name> <api-key>')
    .description('添加新的API提供商配置')
    .option('-u, --base-url <url>', '提供商的基础URL')
    .action(async (name, apiKey, options) => {
    try {
        await file_logger_1.Logger.logCommand('add', [name, '***', options]);
        await (0, add_1.addCommand)(name, apiKey, options);
    }
    catch (error) {
        await handleError(error, 'add');
    }
});
program
    .command('remove <provider>')
    .alias('rm')
    .description('删除指定的提供商配置')
    .action(async (provider) => {
    try {
        await file_logger_1.Logger.logCommand('remove', [provider]);
        await (0, remove_1.removeCommand)(provider);
    }
    catch (error) {
        await handleError(error, 'remove');
    }
});
program
    .command('status')
    .description('检查系统状态和安装情况')
    .action(async () => {
    try {
        await file_logger_1.Logger.logCommand('status', []);
        await (0, status_1.statusCommand)();
    }
    catch (error) {
        await handleError(error, 'status');
    }
});
program
    .command('update')
    .description('更新Claude Code到最新版本')
    .action(async () => {
    try {
        await file_logger_1.Logger.logCommand('update', []);
        await (0, update_1.updateCommand)();
    }
    catch (error) {
        await handleError(error, 'update');
    }
});
program.on('command:*', () => {
    const message = `未知命令: ${program.args.join(' ')}`;
    logger_1.log.error(message);
    file_logger_1.Logger.error(message);
    console.log('运行 ccb --help 查看可用命令');
    process.exit(1);
});
async function handleError(error, context) {
    if (error instanceof errors_1.CCBError) {
        logger_1.log.error(error.message);
        await file_logger_1.Logger.logError(error, context);
        if (process.env.NODE_ENV === 'development' && error.stack) {
            console.error(chalk_1.default.gray(error.stack));
        }
        process.exit(error.exitCode);
    }
    else if (error instanceof Error) {
        logger_1.log.error(`意外错误: ${error.message}`);
        await file_logger_1.Logger.logError(error, context);
        if (process.env.NODE_ENV === 'development' && error.stack) {
            console.error(chalk_1.default.gray(error.stack));
        }
        process.exit(1);
    }
    else {
        const message = `未知错误: ${String(error)}`;
        logger_1.log.error(message);
        await file_logger_1.Logger.error(message, { context, error });
        process.exit(1);
    }
}
process.on('uncaughtException', async (error) => {
    console.error(chalk_1.default.red('未捕获异常:'), error.message);
    await file_logger_1.Logger.logError(error, 'uncaught exception');
    if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
    }
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.error(chalk_1.default.red('未处理的Promise拒绝:'), error.message);
    await file_logger_1.Logger.logError(error, 'unhandled rejection');
    if (process.env.NODE_ENV === 'development') {
        console.error('Promise:', promise);
        console.error('Stack:', error.stack);
    }
    process.exit(1);
});
program.parse();
if (!process.argv.slice(2).length) {
    console.log(chalk_1.default.cyan('Claude Code Bridge - Node.js版本的Claude Code管理工具\n'));
    (0, current_1.currentCommand)().then(() => {
        console.log('');
        console.log('常用命令:');
        console.log('  ccb install            安装Claude Code和配置提供商');
        console.log('  ccb use <provider>      切换API提供商');
        console.log('  ccb ls                  列出所有提供商');
        console.log('  ccb current             显示当前提供商');
        console.log('  ccb status              查看系统状态');
        console.log('');
        console.log('运行 "ccb --help" 查看完整帮助');
    }).catch(() => {
        program.outputHelp();
    });
}
//# sourceMappingURL=index.js.map