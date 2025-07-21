"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommand = installCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../utils/logger");
const system_1 = require("../utils/system");
const manager_1 = require("../config/manager");
async function installCommand(provider, apiKey, options = {}) {
    try {
        logger_1.log.progress('开始安装 Claude Code...');
        const nodeCheck = await system_1.SystemUtils.checkNodeVersion();
        if (!nodeCheck.isValid) {
            if (nodeCheck.version) {
                logger_1.log.error(`Node.js 版本 ${nodeCheck.version} 不符合要求，需要 Node.js 18 或更高版本`);
            }
            else {
                logger_1.log.error('未找到 Node.js，请先安装 Node.js 18 或更高版本');
            }
            process.exit(1);
        }
        logger_1.log.success(`Node.js 版本 ${nodeCheck.version} 符合要求`);
        const npmExists = await system_1.SystemUtils.checkCommand('npm');
        if (!npmExists) {
            logger_1.log.error('npm 未安装，请先安装 npm');
            process.exit(1);
        }
        const npmVersion = await system_1.SystemUtils.getCommandVersion('npm');
        logger_1.log.success(`npm 版本 ${npmVersion} 已安装`);
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (isClaudeInstalled && !options.force) {
            logger_1.log.warning('Claude Code 已经安装');
            const { reinstall } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'reinstall',
                    message: '是否要重新安装？',
                    default: false,
                },
            ]);
            if (!reinstall) {
                logger_1.log.info('跳过安装，继续配置提供商...');
            }
            else {
                await installClaudeCode();
            }
        }
        else {
            await installClaudeCode();
        }
        await configureProvider(provider, apiKey, options);
        logger_1.log.success('Claude Code 安装和配置完成！');
        logger_1.log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以使更改生效');
        logger_1.log.info('运行 `ccb current` 查看当前提供商');
    }
    catch (error) {
        logger_1.log.error(`安装过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
async function installClaudeCode() {
    logger_1.log.progress('正在安装 Claude Code...');
    try {
        await system_1.SystemUtils.installGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        logger_1.log.success('Claude Code 安装成功');
    }
    catch (error) {
        logger_1.log.error(`Claude Code 安装失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
    logger_1.log.progress('配置 Claude Code 跳过引导...');
    await manager_1.ConfigManager.setOnboardingComplete();
    logger_1.log.success('Claude Code 配置完成');
}
async function configureProvider(provider, apiKey, options = {}) {
    let providerName = provider;
    let providerApiKey = apiKey;
    let baseUrl = options.baseUrl;
    if (!providerName) {
        const { selectedProvider } = await inquirer_1.default.prompt([
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
            const customProviderAnswers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: '输入提供商名称:',
                    validate: (input) => input.trim().length > 0 || '提供商名称不能为空',
                },
                {
                    type: 'input',
                    name: 'baseUrl',
                    message: '输入基础 URL:',
                    validate: (input) => input.trim().length > 0 || '基础 URL 不能为空',
                },
            ]);
            providerName = customProviderAnswers.name;
            baseUrl = customProviderAnswers.baseUrl;
        }
        else {
            providerName = selectedProvider;
            if (selectedProvider === 'Moonshot AI') {
                baseUrl = manager_1.ConfigManager.DEFAULT_BASE_URL;
            }
        }
    }
    if (providerName === 'Moonshot AI' && !baseUrl) {
        baseUrl = manager_1.ConfigManager.DEFAULT_BASE_URL;
    }
    if (!providerApiKey) {
        const { inputApiKey } = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'inputApiKey',
                message: `输入 ${providerName} 的 API 密钥:`,
                validate: (input) => input.trim().length > 0 || 'API 密钥不能为空',
            },
        ]);
        providerApiKey = inputApiKey;
    }
    if (providerName === 'Anthropic') {
        await manager_1.ConfigManager.updateEnvironmentVariables({
            name: providerName,
            apiKey: providerApiKey,
        });
        logger_1.log.success(`已配置为使用 ${providerName} API`);
        return;
    }
    await manager_1.ConfigManager.addProvider({
        name: providerName,
        apiKey: providerApiKey,
        baseUrl,
    });
    const newProvider = await manager_1.ConfigManager.getProvider(providerName);
    if (newProvider) {
        await manager_1.ConfigManager.updateEnvironmentVariables(newProvider);
        logger_1.log.success(`已配置为使用 ${providerName} API`);
    }
}
//# sourceMappingURL=install.js.map