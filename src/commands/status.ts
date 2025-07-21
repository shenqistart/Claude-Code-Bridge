import { log } from '../utils/logger';
import { SystemUtils } from '../utils/system';
import { ConfigManager } from '../config/manager';

export async function statusCommand(): Promise<void> {
  try {
    console.log('系统状态检查:\n');

    let allGood = true;

    // 检查 Node.js
    const nodeCheck = await SystemUtils.checkNodeVersion();
    if (nodeCheck.isValid) {
      log.success(`Node.js ${nodeCheck.version}`);
    } else {
      if (nodeCheck.version) {
        log.error(`Node.js ${nodeCheck.version} (需要 18+)`);
      } else {
        log.error('Node.js 未安装');
      }
      allGood = false;
    }

    // 检查 npm
    const npmExists = await SystemUtils.checkCommand('npm');
    if (npmExists) {
      const npmVersion = await SystemUtils.getCommandVersion('npm');
      log.success(`npm ${npmVersion}`);
    } else {
      log.error('npm 未安装');
      allGood = false;
    }

    // 检查 Claude Code
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (isClaudeInstalled) {
      log.success('Claude Code 已安装');
    } else {
      log.error('Claude Code 未安装');
      allGood = false;
    }

    console.log('');

    // 总体状态
    if (allGood) {
      log.success('所有组件都已正确安装');
      console.log('');

      // 显示当前提供商
      const currentProvider = await ConfigManager.getCurrentProvider();
      console.log(`当前提供商: ${currentProvider}`);

      // 显示可用提供商
      const providersConfig = await ConfigManager.loadProviders();
      const providerCount = Object.keys(providersConfig).length + 1; // +1 for Anthropic
      
      if (providerCount > 1) {
        console.log(`\n配置的提供商数量: ${providerCount}`);
        console.log('运行 "ccb ls" 查看所有提供商');
      }
      
      console.log('\n✓ Claude Code 已就绪');
    } else {
      log.warning('发现问题，需要处理:');
      
      if (!nodeCheck.isValid) {
        console.log('  • 安装 Node.js 18 或更高版本');
      }
      if (!npmExists) {
        console.log('  • 安装 npm');
      }
      if (!isClaudeInstalled) {
        console.log('  • 运行 "ccb setup" 安装 Claude Code');
      }
    }

    console.log('');

  } catch (error) {
    log.error(`状态检查失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}