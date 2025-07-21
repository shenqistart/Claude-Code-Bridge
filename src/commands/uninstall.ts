import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { log } from '../utils/logger';
import { SystemUtils } from '../utils/system';
import { ConfigManager } from '../config/manager';

interface UninstallOptions {
  force?: boolean;
}

export async function uninstallCommand(options: UninstallOptions): Promise<void> {
  try {
    let confirm = options.force || false;

    if (!confirm) {
      const { confirmUninstall } = await inquirer.prompt([
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
      log.info('卸载操作已取消');
      return;
    }

    let hasErrors = false;

    // Uninstall Claude Code package
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (isClaudeInstalled) {
      log.progress('正在卸载 Claude Code...');
      try {
        await SystemUtils.uninstallGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
        log.success('Claude Code 卸载成功');
      } catch (error) {
        log.error(`Claude Code 卸载失败: ${error instanceof Error ? error.message : String(error)}`);
        hasErrors = true;
      }
    } else {
      log.info('Claude Code 当前未安装');
    }

    // Remove environment variables
    log.progress('正在从 shell 配置中删除环境变量...');
    try {
      await ConfigManager.clearEnvironmentVariables();
      log.success('环境变量删除成功');
    } catch (error) {
      log.warning('无法删除所有环境变量，请手动检查 shell 配置文件');
      hasErrors = true;
    }

    // Remove Claude configuration directory
    const claudeDir = path.join(os.homedir(), '.claude');
    if (await fs.pathExists(claudeDir)) {
      log.progress('正在删除 Claude 配置目录...');
      try {
        await fs.remove(claudeDir);
        log.success(`已删除 ${claudeDir} 目录`);
      } catch (error) {
        log.error(`无法删除 ${claudeDir} 目录: ${error instanceof Error ? error.message : String(error)}`);
        hasErrors = true;
      }
    } else {
      log.info(`Claude 配置目录 ${claudeDir} 不存在`);
    }

    // Remove Claude configuration file
    const claudeConfigFile = path.join(os.homedir(), '.claude.json');
    if (await fs.pathExists(claudeConfigFile)) {
      log.progress('正在删除 Claude 配置文件...');
      try {
        await fs.remove(claudeConfigFile);
        log.success(`已删除 ${claudeConfigFile} 文件`);
      } catch (error) {
        log.error(`无法删除 ${claudeConfigFile} 文件: ${error instanceof Error ? error.message : String(error)}`);
        hasErrors = true;
      }
    } else {
      log.info(`Claude 配置文件 ${claudeConfigFile} 不存在`);
    }

    // Final status
    if (hasErrors) {
      log.warning('Claude Code 卸载完成，但有一些警告');
      log.info('某些文件或配置可能需要手动删除');
    } else {
      log.success('Claude Code 已完全卸载');
    }

    log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以完成卸载过程');

  } catch (error) {
    log.error(`卸载过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}