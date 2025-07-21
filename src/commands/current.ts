import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

export async function currentCommand(): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      console.log('Claude Code: 未安装');
      console.log('');
      log.info('运行 `ccb setup` 安装和配置 Claude Code');
      return;
    }

    const currentProvider = await ConfigManager.getCurrentProvider();
    console.log(`当前提供商: ${currentProvider}`);

  } catch (error) {
    log.error(`获取当前提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}