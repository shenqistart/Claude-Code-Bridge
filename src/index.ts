#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install';
import { uninstallCommand } from './commands/uninstall';
import { useCommand } from './commands/use';
import { lsCommand } from './commands/ls';
import { currentCommand } from './commands/current';
import { statusCommand } from './commands/status';
import { updateCommand } from './commands/update';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { CCBError } from './utils/errors';
import { Logger } from './utils/file-logger';
import { log } from './utils/logger';

const program = new Command();

program
  .name('ccb')
  .description('Claude Code Bridge - Node.js版本的Claude Code管理工具')
  .version('1.0.0');

// 核心命令 - 模仿nvm设计
program
  .command('install [provider] [api-key]')
  .description('安装Claude Code并配置提供商')
  .option('-u, --base-url <url>', '自定义提供商的基础URL')
  .option('-f, --force', '强制重新安装')
  .action(async (provider, apiKey, options) => {
    try {
      await Logger.logCommand('install', [provider, apiKey ? '***' : null, options]);
      await installCommand(provider, apiKey, options);
    } catch (error) {
      await handleError(error, 'install');
    }
  });

program
  .command('uninstall')
  .description('卸载Claude Code和所有配置')
  .option('-f, --force', '强制卸载，无需确认')
  .action(async (options) => {
    try {
      await Logger.logCommand('uninstall', [options]);
      await uninstallCommand(options);
    } catch (error) {
      await handleError(error, 'uninstall');
    }
  });

program
  .command('use [provider]')
  .description('切换到指定的API提供商')
  .action(async (provider) => {
    try {
      await Logger.logCommand('use', [provider]);
      await useCommand(provider);
    } catch (error) {
      await handleError(error, 'use');
    }
  });

program
  .command('ls')
  .alias('list')
  .description('列出所有已配置的提供商')
  .action(async () => {
    try {
      await Logger.logCommand('ls', []);
      await lsCommand();
    } catch (error) {
      await handleError(error, 'ls');
    }
  });

program
  .command('current')
  .description('显示当前激活的提供商')
  .action(async () => {
    try {
      await Logger.logCommand('current', []);
      await currentCommand();
    } catch (error) {
      await handleError(error, 'current');
    }
  });

program
  .command('add <name> <api-key>')
  .description('添加新的API提供商配置')
  .option('-u, --base-url <url>', '提供商的基础URL')
  .action(async (name, apiKey, options) => {
    try {
      await Logger.logCommand('add', [name, '***', options]);
      await addCommand(name, apiKey, options);
    } catch (error) {
      await handleError(error, 'add');
    }
  });

program
  .command('remove <provider>')
  .alias('rm')
  .description('删除指定的提供商配置')
  .action(async (provider) => {
    try {
      await Logger.logCommand('remove', [provider]);
      await removeCommand(provider);
    } catch (error) {
      await handleError(error, 'remove');
    }
  });

// 系统命令
program
  .command('status')
  .description('检查系统状态和安装情况')
  .action(async () => {
    try {
      await Logger.logCommand('status', []);
      await statusCommand();
    } catch (error) {
      await handleError(error, 'status');
    }
  });

program
  .command('update')
  .description('更新Claude Code到最新版本')
  .action(async () => {
    try {
      await Logger.logCommand('update', []);
      await updateCommand();
    } catch (error) {
      await handleError(error, 'update');
    }
  });

// 全局错误处理
program.on('command:*', () => {
  const message = `未知命令: ${program.args.join(' ')}`;
  log.error(message);
  Logger.error(message);
  console.log('运行 ccb --help 查看可用命令');
  process.exit(1);
});

async function handleError(error: unknown, context: string): Promise<void> {
  if (error instanceof CCBError) {
    log.error(error.message);
    await Logger.logError(error, context);
    
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(error.exitCode);
  } else if (error instanceof Error) {
    log.error(`意外错误: ${error.message}`);
    await Logger.logError(error, context);
    
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  } else {
    const message = `未知错误: ${String(error)}`;
    log.error(message);
    await Logger.error(message, { context, error });
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', async (error) => {
  console.error(chalk.red('未捕获异常:'), error.message);
  await Logger.logError(error, 'uncaught exception');
  
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
  
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  console.error(chalk.red('未处理的Promise拒绝:'), error.message);
  await Logger.logError(error, 'unhandled rejection');
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Promise:', promise);
    console.error('Stack:', error.stack);
  }
  
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供命令，显示状态和帮助
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan('Claude Code Bridge - Node.js版本的Claude Code管理工具\n'));
  
  // 尝试显示当前状态
  currentCommand().then(() => {
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