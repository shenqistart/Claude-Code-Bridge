import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { lsCommand } from '../../src/commands/ls';
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

describe('ls command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
  });

  test('should list all providers when Claude Code is installed', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Anthropic (using official API defaults)');
    mockConfigManager.loadProviders.mockResolvedValue({
      'Moonshot AI': {
        base_url: 'https://api.moonshot.cn/anthropic/',
        api_key: 'test-key'
      },
      'Custom Provider': {
        base_url: 'https://custom.example.com',
        api_key: 'custom-key'
      }
    });

    await lsCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('可用提供商:');
    expect(mockConsole.log).toHaveBeenCalledWith('');
    expect(mockConsole.log).toHaveBeenCalledWith('→ Anthropic (官方 API)');
    expect(mockConsole.log).toHaveBeenCalledWith('  Moonshot AI - https://api.moonshot.cn/anthropic/');
    expect(mockConsole.log).toHaveBeenCalledWith('  Custom Provider - https://custom.example.com');
    expect(mockConsole.log).toHaveBeenCalledWith('');
    expect(mockConsole.log).toHaveBeenCalledWith('当前提供商: Anthropic (using official API defaults)');
  });

  test('should show current provider indicator correctly', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Moonshot AI (https://api.moonshot.cn/anthropic/)');
    mockConfigManager.loadProviders.mockResolvedValue({
      'Moonshot AI': {
        base_url: 'https://api.moonshot.cn/anthropic/',
        api_key: 'test-key'
      }
    });

    await lsCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('  Anthropic (官方 API)');
    expect(mockConsole.log).toHaveBeenCalledWith('→ Moonshot AI - https://api.moonshot.cn/anthropic/');
  });

  test('should show installation message when Claude Code is not installed', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(false);

    await lsCommand();

    expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Claude Code 未安装'));
    expect(mockConfigManager.getCurrentProvider).not.toHaveBeenCalled();
  });

  test('should handle empty providers list', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Anthropic (using official API defaults)');
    mockConfigManager.loadProviders.mockResolvedValue({});

    await lsCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('→ Anthropic (官方 API)');
    expect(mockConsole.log).toHaveBeenCalledWith('当前提供商: Anthropic (using official API defaults)');
  });

  test('should handle errors gracefully', async () => {
    mockSystemUtils.checkGlobalPackage.mockRejectedValue(new Error('Check failed'));
    
    const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(lsCommand()).rejects.toThrow('process.exit called');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    mockProcessExit.mockRestore();
  });
});