import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

export async function removeCommand(provider: string): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb install` 先安装 Claude Code');
      return;
    }

    // 不允许删除 Anthropic 提供商
    if (provider === 'Anthropic') {
      log.error('不能删除内置的 Anthropic 提供商');
      process.exit(1);
    }

    // 检查提供商是否存在
    const providerConfig = await ConfigManager.getProvider(provider);
    if (!providerConfig) {
      log.error(`提供商 "${provider}" 不存在`);
      log.info('运行 `ccb ls` 查看可用的提供商');
      process.exit(1);
    }

    // 确认删除
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认删除提供商 "${provider}"？`,
        default: false,
      },
    ]);

    if (!confirm) {
      log.info('操作已取消');
      return;
    }

    // 删除提供商配置
    const removed = await ConfigManager.removeProvider(provider);
    if (removed) {
      log.success(`提供商 "${provider}" 删除成功`);
      
      // 检查是否是当前激活的提供商
      const currentProvider = await ConfigManager.getCurrentProvider();
      if (currentProvider.includes(provider)) {
        log.warning('您删除了当前正在使用的提供商');
        log.info('请运行 `ccb use <provider>` 切换到其他提供商');
      }
    } else {
      log.error(`删除提供商 "${provider}" 失败`);
    }

  } catch (error) {
    log.error(`删除提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}