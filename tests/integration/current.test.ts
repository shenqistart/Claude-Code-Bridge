import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { currentCommand } from '../../src/commands/current';
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

describe('current command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
  });

  test('should display current provider when Claude Code is installed', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(true);
    mockConfigManager.getCurrentProvider.mockResolvedValue('Anthropic (using official API defaults)');

    // Mock process.exit to spy on it
    const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await currentCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('当前提供商: Anthropic (using official API defaults)');
    expect(mockProcessExit).not.toHaveBeenCalled();
    
    mockProcessExit.mockRestore();
  });

  test('should show installation message when Claude Code is not installed', async () => {
    mockSystemUtils.checkGlobalPackage.mockResolvedValue(false);

    await currentCommand();

    expect(mockConsole.log).toHaveBeenCalledWith('Claude Code: 未安装');
    expect(mockConsole.log).toHaveBeenCalledWith('');
    expect(mockSystemUtils.checkGlobalPackage).toHaveBeenCalledWith(ConfigManager.CLAUDE_PACKAGE);
  });

  test('should handle errors gracefully', async () => {
    mockSystemUtils.checkGlobalPackage.mockRejectedValue(new Error('Check failed'));
    
    const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(currentCommand()).rejects.toThrow('process.exit called');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    mockProcessExit.mockRestore();
  });
});