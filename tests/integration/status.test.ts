import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { statusCommand } from '../../src/commands/status';
import { ConfigManager } from '../../src/config/manager';
import { SystemUtils } from '../../src/utils/system';

// Mock dependencies
jest.mock('../../src/config/manager');
jest.mock('../../src/utils/system');

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
const mockSystemUtils = SystemUtils as jest.Mocked<typeof SystemUtils>;

// Mock console
const mockConsole = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('status command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
  });

  test('should show all components as installed and ready', async () => {
    // Mock all checks to pass
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: true, 
      version: 'v20.0.0' 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(true);
    mockSystemUtils.getCommandVersion.mockResolvedValue('10.0.0');
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Anthropic (using official API defaults)');
    mockConfigManager.loadProviders.mockResolvedValue({
      'Moonshot AI': { api_key: 'test-key' }
    });

    await statusCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('系统状态检查:\n');
    expect(mockConsole.log).toHaveBeenCalledWith('');
    expect(mockConsole.log).toHaveBeenCalledWith('当前提供商: Anthropic (using official API defaults)');
    expect(mockConsole.log).toHaveBeenCalledWith('\n配置的提供商数量: 2');
    expect(mockConsole.log).toHaveBeenCalledWith('\n✓ Claude Code 已就绪');
  });

  test('should show problems when Node.js version is invalid', async () => {
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: false, 
      version: 'v16.0.0' 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(true);
    mockSystemUtils.getCommandVersion.mockResolvedValue('9.0.0');
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(false);

    await statusCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('  • 安装 Node.js 18 或更高版本');
    expect(mockConsole.log).toHaveBeenCalledWith('  • 运行 "ccb setup" 安装 Claude Code');
  });

  test('should show problems when Node.js is not installed', async () => {
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: false, 
      version: null 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(false);
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(false);

    await statusCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('  • 安装 Node.js 18 或更高版本');
    expect(mockConsole.log).toHaveBeenCalledWith('  • 安装 npm');
    expect(mockConsole.log).toHaveBeenCalledWith('  • 运行 "ccb setup" 安装 Claude Code');
  });

  test('should show problems when npm is not installed', async () => {
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: true, 
      version: 'v20.0.0' 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(false);
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);

    await statusCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('  • 安装 npm');
  });

  test('should show problems when Claude Code is not installed', async () => {
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: true, 
      version: 'v20.0.0' 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(true);
    mockSystemUtils.getCommandVersion.mockResolvedValue('10.0.0');
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(false);

    await statusCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('  • 运行 "ccb setup" 安装 Claude Code');
  });

  test('should handle single provider (only Anthropic)', async () => {
    mockSystemUtils.checkNodeVersion.mockResolvedValue({ 
      isValid: true, 
      version: 'v20.0.0' 
    });
    mockSystemUtils.checkCommand.mockResolvedValue(true);
    mockSystemUtils.getCommandVersion.mockResolvedValue('10.0.0');
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Anthropic (using official API defaults)');
    mockConfigManager.loadProviders.mockResolvedValue({});

    await statusCommand();

    // Should not show provider count when only Anthropic exists
    expect(mockConsole.log).not.toHaveBeenCalledWith(expect.stringContaining('配置的提供商数量'));
  });

  test('should handle errors gracefully', async () => {
    mockSystemUtils.checkNodeVersion.mockRejectedValue(new Error('Check failed'));
    
    const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(statusCommand()).rejects.toThrow('process.exit called');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    mockProcessExit.mockRestore();
  });
});