import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

interface AddOptions {
  baseUrl?: string;
}

export async function addCommand(name: string, apiKey: string, options: AddOptions = {}): Promise<void> {
  try {
    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装');
      log.info('运行 `ccb install` 先安装 Claude Code');
      process.exit(1);
    }

    // 检查提供商是否已存在
    const existingProvider = await ConfigManager.getProvider(name);
    if (existingProvider || name === 'Anthropic') {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `提供商 "${name}" 已存在，是否覆盖配置？`,
          default: false,
        },
      ]);

      if (!overwrite) {
        log.info('操作已取消');
        return;
      }
    }

    let baseUrl = options.baseUrl;

    // 如果没有提供基础URL，询问用户
    if (!baseUrl && name !== 'Anthropic') {
      const { inputBaseUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputBaseUrl',
          message: `输入 ${name} 的基础 URL (留空则无需自定义 URL):`,
        },
      ]);
      baseUrl = inputBaseUrl || undefined;
    }

    // 处理 Anthropic 提供商
    if (name === 'Anthropic') {
      await ConfigManager.updateEnvironmentVariables({
        name: 'Anthropic',
        apiKey,
      });
      log.success(`Anthropic API 配置已更新`);
      return;
    }

    // 保存提供商配置
    await ConfigManager.addProvider({
      name,
      apiKey,
      baseUrl,
    });

    log.success(`提供商 "${name}" 添加成功`);
    log.info(`运行 "ccb use ${name}" 切换到此提供商`);

  } catch (error) {
    log.error(`添加提供商失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}