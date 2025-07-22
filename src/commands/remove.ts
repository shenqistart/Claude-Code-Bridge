import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

// 模糊匹配函数
function fuzzyMatch(input: string, providers: string[]): string[] {
  const inputLower = input.toLowerCase();
  
  // 精确匹配
  const exactMatch = providers.filter(p => p.toLowerCase() === inputLower);
  if (exactMatch.length > 0) {
    return exactMatch;
  }
  
  // 开头匹配
  const startsWith = providers.filter(p => p.toLowerCase().startsWith(inputLower));
  if (startsWith.length > 0) {
    return startsWith;
  }
  
  // 包含匹配
  const contains = providers.filter(p => p.toLowerCase().includes(inputLower));
  if (contains.length > 0) {
    return contains;
  }
  
  // 模糊匹配（首字母或关键词）
  const fuzzy = providers.filter(p => {
    const providerLower = p.toLowerCase();
    const words = providerLower.split(' ');
    
    // 检查是否匹配首字母缩写
    const initials = words.map(word => word[0]).join('');
    if (initials.includes(inputLower)) {
      return true;
    }
    
    // 检查是否匹配任何单词的开头
    return words.some(word => word.startsWith(inputLower));
  });
  
  return fuzzy;
}

export async function removeCommand(provider: string): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb install` 先安装 Claude Code');
      return;
    }

    // 获取所有提供商并执行模糊匹配
    const allProviders = await ConfigManager.listProviders();
    const customProviders = allProviders.filter(p => p !== 'Anthropic'); // 排除Anthropic
    
    const matches = fuzzyMatch(provider, customProviders);
    
    let targetProvider = provider;
    
    if (matches.length === 0) {
      log.error(`没有找到匹配的提供商 "${provider}"`);
      log.info('可删除的提供商:');
      customProviders.forEach(p => {
        log.info(`  • ${p}`);
      });
      log.info('运行 `ccb ls` 查看详细信息');
      process.exit(1);
    } else if (matches.length === 1) {
      targetProvider = matches[0];
      if (targetProvider !== provider) {
        log.info(`模糊匹配到提供商: ${targetProvider}`);
      }
    } else {
      // 多个匹配结果，让用户选择
      log.info(`找到多个匹配的提供商:`);
      matches.forEach(p => {
        log.info(`  • ${p}`);
      });
      
      const { selectedProvider } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedProvider',
          message: '请选择要删除的提供商:',
          choices: matches,
        },
      ]);
      targetProvider = selectedProvider;
    }

    // 不允许删除 Anthropic 提供商
    if (targetProvider === 'Anthropic') {
      log.error('不能删除内置的 Anthropic 提供商');
      process.exit(1);
    }

    // 检查提供商是否存在
    const providerConfig = await ConfigManager.getProvider(targetProvider);
    if (!providerConfig) {
      log.error(`提供商 "${targetProvider}" 不存在`);
      log.info('运行 `ccb ls` 查看可用的提供商');
      process.exit(1);
    }

    // 确认删除
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认删除提供商 "${targetProvider}"？`,
        default: false,
      },
    ]);

    if (!confirm) {
      log.info('操作已取消');
      return;
    }

    // 删除提供商配置
    const removed = await ConfigManager.removeProvider(targetProvider);
    if (removed) {
      log.success(`提供商 "${targetProvider}" 删除成功`);
      
      // 检查是否是当前激活的提供商
      const currentProvider = await ConfigManager.getCurrentProvider();
      if (currentProvider.includes(targetProvider)) {
        log.warning('您删除了当前正在使用的提供商');
        log.info('请运行 `ccb use <provider>` 切换到其他提供商');
      }
    } else {
      log.error(`删除提供商 "${targetProvider}" 失败`);
    }

  } catch (error) {
    log.error(`删除提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}