import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

export async function useCommand(provider?: string): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb setup` 先安装和配置 Claude Code');
      process.exit(1);
    }

    let targetProvider = provider;

    // 如果没有指定提供商，显示选择列表
    if (!targetProvider) {
      const providers = await ConfigManager.listProviders();
      
      if (providers.length === 1) {
        log.warning('没有配置的提供商可以切换');
        log.info('运行 `ccb add <name> <api-key>` 添加新的提供商');
        return;
      }

      const { selectedProvider } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedProvider',
          message: '选择要切换到的提供商:',
          choices: providers,
        },
      ]);
      targetProvider = selectedProvider;
    }

    // 处理 Anthropic 提供商
    if (targetProvider === 'Anthropic') {
      // 获取 API 密钥（如果当前环境变量中没有）
      const configFile = ConfigManager.getShellConfigFile();
      let hasApiKey = false;
      
      try {
        const fs = await import('fs-extra');
        const content = await fs.readFile(configFile, 'utf8');
        hasApiKey = content.includes('ANTHROPIC_API_KEY');
      } catch {
        // 文件不存在或无法读取
      }

      if (!hasApiKey) {
        const { apiKey } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '输入 Anthropic API 密钥:',
            validate: (input: string) => input.trim().length > 0 || 'API 密钥不能为空',
          },
        ]);

        await ConfigManager.updateEnvironmentVariables({
          name: 'Anthropic',
          apiKey,
        });
      } else {
        // 只清除 base URL，保留现有的 API 密钥配置
        const fs = await import('fs-extra');
        const content = await fs.readFile(configFile, 'utf8');
        
        // 提取现有的 API 密钥
        const lines = content.split('\n');
        let existingApiKey = '';
        
        for (const line of lines) {
          if (line.includes('ANTHROPIC_API_KEY')) {
            const match = line.match(/"([^"]+)"/);
            if (match) {
              existingApiKey = match[1];
              break;
            }
          }
        }
        
        if (existingApiKey) {
          await ConfigManager.updateEnvironmentVariables({
            name: 'Anthropic',
            apiKey: existingApiKey,
          });
        }
      }
      
      log.success('已切换到 Anthropic (官方 API)');
      log.info('请重启终端或运行 `source ~/.bashrc` 以使更改生效');
      return;
    }

    // 处理其他提供商
    if (!targetProvider) {
      log.error('没有指定要切换到的提供商');
      return;
    }
    
    const providerConfig = await ConfigManager.getProvider(targetProvider);
    if (!providerConfig) {
      log.error(`提供商 "${targetProvider}" 不存在`);
      log.info('运行 `ccb ls` 查看可用的提供商');
      process.exit(1);
    }

    await ConfigManager.updateEnvironmentVariables(providerConfig);
    log.success(`已切换到提供商: ${targetProvider}`);
    log.info('请重启终端或运行 `source ~/.bashrc` 以使更改生效');

  } catch (error) {
    log.error(`切换提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}