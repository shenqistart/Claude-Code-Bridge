import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { ConfigManager } from '../config/manager';
import { SystemUtils } from '../utils/system';

interface ProviderCommandOptions {
  name?: string;
  apiKey?: string;
  baseUrl?: string;
}

export async function providerCommand(action: string, options: ProviderCommandOptions = {}): Promise<void> {
  try {
    // Check if Claude Code is installed
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (!isClaudeInstalled) {
      log.error('Claude Code 未安装，请先运行 `ccb install` 安装');
      process.exit(1);
    }

    switch (action) {
      case 'add':
        await addProvider(options);
        break;
      case 'list':
        await listProviders();
        break;
      case 'switch':
        await switchProvider(options);
        break;
      case 'remove':
        await removeProvider(options);
        break;
      default:
        log.error(`未知的提供商命令: ${action}`);
        process.exit(1);
    }
  } catch (error) {
    log.error(`提供商操作失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function addProvider(options: ProviderCommandOptions): Promise<void> {
  let { name, apiKey, baseUrl } = options;

  // Get provider name if not provided
  if (!name) {
    const { inputName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputName',
        message: '输入提供商名称:',
        validate: (input: string) => input.trim().length > 0 || '提供商名称不能为空',
      },
    ]);
    name = inputName;
  }

  // Check if provider already exists
  const existingProvider = await ConfigManager.getProvider(name!);
  if (existingProvider || name === 'Anthropic') {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `提供商 "${name}" 已存在，是否覆盖？`,
        default: false,
      },
    ]);

    if (!overwrite) {
      log.info('操作已取消');
      return;
    }
  }

  // Get base URL if not provided
  if (!baseUrl) {
    const { inputBaseUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputBaseUrl',
        message: `输入 ${name} 的基础 URL:`,
        validate: (input: string) => input.trim().length > 0 || '基础 URL 不能为空',
      },
    ]);
    baseUrl = inputBaseUrl;
  }

  // Get API key if not provided
  if (!apiKey) {
    const { inputApiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'inputApiKey',
        message: `输入 ${name} 的 API 密钥:`,
        validate: (input: string) => input.trim().length > 0 || 'API 密钥不能为空',
      },
    ]);
    apiKey = inputApiKey;
  }

  // Save provider
  await ConfigManager.addProvider({
    name: name!,
    apiKey: apiKey!,
    baseUrl,
  });

  log.success(`提供商 "${name}" 添加成功`);
}

async function listProviders(): Promise<void> {
  log.info('可用的提供商:');
  
  const currentProvider = await ConfigManager.getCurrentProvider();
  
  console.log(`\nAnthropic: 使用官方 API 默认设置`);
  
  const providersConfig = await ConfigManager.loadProviders();
  for (const [name, config] of Object.entries(providersConfig)) {
    const baseUrlInfo = config.base_url ? ` (${config.base_url})` : '';
    console.log(`${name}: ${baseUrlInfo}`);
  }
  
  console.log(`\n当前提供商: ${currentProvider}`);
}

async function switchProvider(options: ProviderCommandOptions): Promise<void> {
  let { name } = options;

  if (!name) {
    const providers = await ConfigManager.listProviders();
    const { selectedProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProvider',
        message: '选择要切换到的提供商:',
        choices: providers,
      },
    ]);
    name = selectedProvider;
  }

  if (name === 'Anthropic') {
    // Clear environment variables to use Anthropic defaults
    await ConfigManager.clearEnvironmentVariables();
    log.success('已切换到 Anthropic (使用官方 API 默认设置)');
    return;
  }

  const provider = await ConfigManager.getProvider(name!);
  if (!provider) {
    log.error(`提供商 "${name}" 不存在`);
    process.exit(1);
  }

  await ConfigManager.updateEnvironmentVariables(provider);
  log.success(`已切换到提供商: ${name}`);
  log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以使更改生效');
}

async function removeProvider(options: ProviderCommandOptions): Promise<void> {
  let { name } = options;

  if (!name) {
    const providersConfig = await ConfigManager.loadProviders();
    const providerNames = Object.keys(providersConfig);
    
    if (providerNames.length === 0) {
      log.info('没有可删除的提供商');
      return;
    }

    const { selectedProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProvider',
        message: '选择要删除的提供商:',
        choices: providerNames,
      },
    ]);
    name = selectedProvider;
  }

  if (name === 'Anthropic') {
    log.error('不能删除内置的 Anthropic 提供商');
    process.exit(1);
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `确认删除提供商 "${name}"？`,
      default: false,
    },
  ]);

  if (!confirm) {
    log.info('操作已取消');
    return;
  }

  const removed = await ConfigManager.removeProvider(name!);
  if (removed) {
    log.success(`提供商 "${name}" 删除成功`);
  } else {
    log.error(`提供商 "${name}" 不存在`);
  }
}