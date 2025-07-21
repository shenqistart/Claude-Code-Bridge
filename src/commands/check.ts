import { log } from '../utils/logger';
import { SystemUtils } from '../utils/system';
import { ConfigManager } from '../config/manager';

export async function checkCommand(): Promise<void> {
  try {
    log.info('检查系统要求和安装状态...\n');

    let allGood = true;

    // Check Node.js
    const nodeCheck = await SystemUtils.checkNodeVersion();
    if (nodeCheck.isValid) {
      log.success(`Node.js 版本 ${nodeCheck.version} 已安装`);
    } else {
      if (nodeCheck.version) {
        log.error(`Node.js 版本 ${nodeCheck.version} 不符合要求，需要 18 或更高版本`);
      } else {
        log.error('Node.js 未安装');
      }
      allGood = false;
    }

    // Check npm
    const npmExists = await SystemUtils.checkCommand('npm');
    if (npmExists) {
      const npmVersion = await SystemUtils.getCommandVersion('npm');
      log.success(`npm 版本 ${npmVersion} 已安装`);
    } else {
      log.error('npm 未安装');
      allGood = false;
    }

    // Check Claude Code
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (isClaudeInstalled) {
      log.success('Claude Code 已安装');
    } else {
      log.error('Claude Code 未安装');
      allGood = false;
    }

    console.log('');

    // Overall status
    if (allGood) {
      log.success('系统状态: 所有要求均已满足，Claude Code 可以正常使用');
      console.log('');

      // Show current provider
      const currentProvider = await ConfigManager.getCurrentProvider();
      log.info(`当前提供商: ${currentProvider}`);

      // Show available providers
      const providers = await ConfigManager.listProviders();
      if (providers.length > 1) {
        console.log('\n可用提供商:');
        const providersConfig = await ConfigManager.loadProviders();
        
        console.log('  Anthropic: 使用官方 API 默认设置');
        for (const [name, config] of Object.entries(providersConfig)) {
          const baseUrlInfo = config.base_url ? ` (${config.base_url})` : '';
          console.log(`  ${name}:${baseUrlInfo}`);
        }
      }
    } else {
      log.error('系统状态: 缺少必需的依赖项');
      
      if (!nodeCheck.isValid) {
        log.info('  请安装 Node.js 18 或更高版本');
      }
      if (!npmExists) {
        log.info('  请安装 npm');
      }
      if (!isClaudeInstalled) {
        log.info('  运行 `ccb install` 安装 Claude Code');
      }
    }

    console.log('');

  } catch (error) {
    log.error(`检查过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}