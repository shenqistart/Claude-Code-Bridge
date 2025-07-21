import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

export async function lsCommand(): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb setup` 先安装和配置 Claude Code');
      return;
    }

    const currentProvider = await ConfigManager.getCurrentProvider();
    const providersConfig = await ConfigManager.loadProviders();
    
    console.log('可用提供商:');
    console.log('');
    
    // 显示 Anthropic (内置)
    const isAnthropicCurrent = currentProvider.includes('Anthropic');
    const anthropicPrefix = isAnthropicCurrent ? '→' : ' ';
    console.log(`${anthropicPrefix} Anthropic (官方 API)`);
    
    // 显示配置的提供商
    for (const [name, config] of Object.entries(providersConfig)) {
      const isCurrentProvider = currentProvider.includes(name);
      const prefix = isCurrentProvider ? '→' : ' ';
      const baseUrlInfo = config.base_url ? ` - ${config.base_url}` : '';
      console.log(`${prefix} ${name}${baseUrlInfo}`);
    }
    
    console.log('');
    console.log(`当前提供商: ${currentProvider}`);
    console.log('');
    console.log('使用 "ccb use <provider>" 切换提供商');

  } catch (error) {
    log.error(`列出提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}