"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerCommand = providerCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../utils/logger");
const manager_1 = require("../config/manager");
const system_1 = require("../utils/system");
async function providerCommand(action, options = {}) {
    try {
        const isClaudeInstalled = await system_1.SystemUtils.checkGlobalPackage(manager_1.ConfigManager.CLAUDE_PACKAGE);
        if (!isClaudeInstalled) {
            logger_1.log.error('Claude Code 未安装，请先运行 `ccb install` 安装');
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
                logger_1.log.error(`未知的提供商命令: ${action}`);
                process.exit(1);
        }
    }
    catch (error) {
        logger_1.log.error(`提供商操作失败: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
async function addProvider(options) {
    let { name, apiKey, baseUrl } = options;
    if (!name) {
        const { inputName } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'inputName',
                message: '输入提供商名称:',
                validate: (input) => input.trim().length > 0 || '提供商名称不能为空',
            },
        ]);
        name = inputName;
    }
    const existingProvider = await manager_1.ConfigManager.getProvider(name);
    if (existingProvider || name === 'Anthropic') {
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `提供商 "${name}" 已存在，是否覆盖？`,
                default: false,
            },
        ]);
        if (!overwrite) {
            logger_1.log.info('操作已取消');
            return;
        }
    }
    if (!baseUrl) {
        const { inputBaseUrl } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'inputBaseUrl',
                message: `输入 ${name} 的基础 URL:`,
                validate: (input) => input.trim().length > 0 || '基础 URL 不能为空',
            },
        ]);
        baseUrl = inputBaseUrl;
    }
    if (!apiKey) {
        const { inputApiKey } = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'inputApiKey',
                message: `输入 ${name} 的 API 密钥:`,
                validate: (input) => input.trim().length > 0 || 'API 密钥不能为空',
            },
        ]);
        apiKey = inputApiKey;
    }
    await manager_1.ConfigManager.addProvider({
        name: name,
        apiKey: apiKey,
        baseUrl,
    });
    logger_1.log.success(`提供商 "${name}" 添加成功`);
}
async function listProviders() {
    logger_1.log.info('可用的提供商:');
    const currentProvider = await manager_1.ConfigManager.getCurrentProvider();
    console.log(`\nAnthropic: 使用官方 API 默认设置`);
    const providersConfig = await manager_1.ConfigManager.loadProviders();
    for (const [name, config] of Object.entries(providersConfig)) {
        const baseUrlInfo = config.base_url ? ` (${config.base_url})` : '';
        console.log(`${name}: ${baseUrlInfo}`);
    }
    console.log(`\n当前提供商: ${currentProvider}`);
}
async function switchProvider(options) {
    let { name } = options;
    if (!name) {
        const providers = await manager_1.ConfigManager.listProviders();
        const { selectedProvider } = await inquirer_1.default.prompt([
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
        await manager_1.ConfigManager.clearEnvironmentVariables();
        logger_1.log.success('已切换到 Anthropic (使用官方 API 默认设置)');
        return;
    }
    const provider = await manager_1.ConfigManager.getProvider(name);
    if (!provider) {
        logger_1.log.error(`提供商 "${name}" 不存在`);
        process.exit(1);
    }
    await manager_1.ConfigManager.updateEnvironmentVariables(provider);
    logger_1.log.success(`已切换到提供商: ${name}`);
    logger_1.log.info('请重启终端或运行 `source ~/.bashrc` （或您的 shell 配置文件）以使更改生效');
}
async function removeProvider(options) {
    let { name } = options;
    if (!name) {
        const providersConfig = await manager_1.ConfigManager.loadProviders();
        const providerNames = Object.keys(providersConfig);
        if (providerNames.length === 0) {
            logger_1.log.info('没有可删除的提供商');
            return;
        }
        const { selectedProvider } = await inquirer_1.default.prompt([
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
        logger_1.log.error('不能删除内置的 Anthropic 提供商');
        process.exit(1);
    }
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `确认删除提供商 "${name}"？`,
            default: false,
        },
    ]);
    if (!confirm) {
        logger_1.log.info('操作已取消');
        return;
    }
    const removed = await manager_1.ConfigManager.removeProvider(name);
    if (removed) {
        logger_1.log.success(`提供商 "${name}" 删除成功`);
    }
    else {
        logger_1.log.error(`提供商 "${name}" 不存在`);
    }
}
//# sourceMappingURL=provider.js.map