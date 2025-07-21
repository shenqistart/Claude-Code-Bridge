import inquirer from 'inquirer';
import { log } from '../utils/logger';
import { SystemUtils } from '../utils/system';
import { ConfigManager } from '../config/manager';

interface InstallOptions {
  baseUrl?: string;
  force?: boolean;
}

export async function installCommand(provider?: string, apiKey?: string, options: InstallOptions = {}): Promise<void> {
  try {
    log.progress('开始安装 Claude Code...');

    // 检查 Node.js 版本
    const nodeCheck = await SystemUtils.checkNodeVersion();
    if (!nodeCheck.isValid) {
      if (nodeCheck.version) {
        log.error(`Node.js 版本 ${nodeCheck.version} 不符合要求，需要 Node.js 18 或更高版本`);
      } else {
        log.error('未找到 Node.js，请先安装 Node.js 18 或更高版本');
      }
      process.exit(1);
    }
    
    log.success(`Node.js 版本 ${nodeCheck.version} 符合要求`);

    // 检查 npm
    const npmExists = await SystemUtils.checkCommand('npm');
    if (!npmExists) {
      log.error('npm 未安装，请先安装 npm');
      process.exit(1);
    }

    const npmVersion = await SystemUtils.getCommandVersion('npm');
    log.success(`npm 版本 ${npmVersion} 已安装`);

    // 检查 Claude Code 是否已安装
    const isClaudeInstalled = await SystemUtils.checkGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    if (isClaudeInstalled && !options.force) {
      log.warning('Claude Code 已经安装');
      const { reinstall } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reinstall',
          message: '是否要重新安装？',
          default: false,
        },
      ]);

      if (!reinstall) {
        log.info('跳过安装，继续配置提供商...');
      } else {
        await installClaudeCode();
      }
    } else {
      await installClaudeCode();
    }

    // 配置提供商
    await configureProvider(provider, apiKey, options);

    log.success('Claude Code 安装和配置完成！');
    log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以使更改生效');
    log.info('运行 `ccb current` 查看当前提供商');

  } catch (error) {
    log.error(`安装过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function installClaudeCode(): Promise<void> {
  log.progress('正在安装 Claude Code...');
  try {
    await SystemUtils.installGlobalPackage(ConfigManager.CLAUDE_PACKAGE);
    log.success('Claude Code 安装成功');
  } catch (error) {
    log.error(`Claude Code 安装失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  
  // 配置跳过引导
  log.progress('配置 Claude Code 跳过引导...');
  await ConfigManager.setOnboardingComplete();
  log.success('Claude Code 配置完成');
}

async function configureProvider(provider?: string, apiKey?: string, options: InstallOptions = {}): Promise<void> {
  let providerName = provider;
  let providerApiKey = apiKey;
  let baseUrl = options.baseUrl;

  // 如果没有指定提供商，启动交互式配置
  if (!providerName) {
    const { selectedProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProvider',
        message: '请选择 API 提供商:',
        choices: [
          { name: 'Anthropic (官方 API)', value: 'Anthropic' },
          { name: 'Moonshot AI (兼容 API，支持最新 Kimi 模型)', value: 'Moonshot AI' },
          { name: '自定义提供商', value: 'custom' },
        ],
      },
    ]);

    if (selectedProvider === 'custom') {
      const customProviderAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '输入提供商名称:',
          validate: (input: string) => input.trim().length > 0 || '提供商名称不能为空',
        },
        {
          type: 'input',
          name: 'baseUrl',
          message: '输入基础 URL:',
          validate: (input: string) => input.trim().length > 0 || '基础 URL 不能为空',
        },
      ]);

      providerName = customProviderAnswers.name;
      baseUrl = customProviderAnswers.baseUrl;
    } else {
      providerName = selectedProvider;
      if (selectedProvider === 'Moonshot AI') {
        baseUrl = ConfigManager.DEFAULT_BASE_URL;
      }
    }
  }

  // 为 Moonshot AI 设置默认 URL（如果没有指定）
  if (providerName === 'Moonshot AI' && !baseUrl) {
    baseUrl = ConfigManager.DEFAULT_BASE_URL;
  }

  // 获取 API 密钥（如果没有提供）
  if (!providerApiKey) {
    const { inputApiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'inputApiKey',
        message: `输入 ${providerName} 的 API 密钥:`,
        validate: (input: string) => input.trim().length > 0 || 'API 密钥不能为空',
      },
    ]);
    providerApiKey = inputApiKey;
  }

  // 处理 Anthropic 提供商（不需要保存到 providers.json）
  if (providerName === 'Anthropic') {
    await ConfigManager.updateEnvironmentVariables({
      name: providerName,
      apiKey: providerApiKey!,
    });
    log.success(`已配置为使用 ${providerName} API`);
    return;
  }

  // 保存提供商配置
  await ConfigManager.addProvider({
    name: providerName!,
    apiKey: providerApiKey!,
    baseUrl,
  });

  // 切换到新提供商
  const newProvider = await ConfigManager.getProvider(providerName!);
  if (newProvider) {
    await ConfigManager.updateEnvironmentVariables(newProvider);
    log.success(`已配置为使用 ${providerName} API`);
  }
}