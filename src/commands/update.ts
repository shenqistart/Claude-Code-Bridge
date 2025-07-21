import { log } from '../utils/logger';
import { SystemUtils } from '../utils/system';
import { ConfigManager } from '../config/manager';

export async function updateCommand(): Promise<void> {
  try {
    // Check if Claude Code is installed
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb install` 安装 Claude Code');
      process.exit(1);
    }

    log.progress('正在更新 Claude Code...');
    
    try {
      await SystemUtils.updateGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
      log.success('Claude Code 已更新到最新版本');
    } catch (error) {
      log.error(`更新失败: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }

  } catch (error) {
    log.error(`更新过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}