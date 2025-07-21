import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { SystemUtils } from '../../src/utils/system';

// Mock child_process and util modules
jest.mock('child_process');
jest.mock('util');

describe('SystemUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeCommand', () => {
    test('should execute command successfully', async () => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event: string, callback: (data: string) => void) => {
            if (event === 'data') callback('test output');
          })
        },
        stderr: {
          on: jest.fn((event: string, callback: (data: string) => void) => {
            if (event === 'data') callback('');
          })
        },
        on: jest.fn((event: string, callback: (code: number) => void) => {
          if (event === 'close') callback(0);
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.executeCommand('test', ['arg1']);
      expect(result.stdout).toBe('test output');
      expect(result.stderr).toBe('');
      expect(result.exitCode).toBe(0);
    });

    test('should handle command with stderr output', async () => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event: string, callback: (data: string) => void) => {
            if (event === 'data') callback('');
          })
        },
        stderr: {
          on: jest.fn((event: string, callback: (data: string) => void) => {
            if (event === 'data') callback('error message');
          })
        },
        on: jest.fn((event: string, callback: (code: number) => void) => {
          if (event === 'close') callback(1);
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.executeCommand('test', []);
      expect(result.stderr).toBe('error message');
      expect(result.exitCode).toBe(1);
    });

    test('should handle process error', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event: string, callback: (error: Error) => void) => {
          if (event === 'error') callback(new Error('Process error'));
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      await expect(SystemUtils.executeCommand('nonexistent', []))
        .rejects
        .toThrow('Process error');
    });
  });

  describe('checkNodeVersion', () => {
    test('should return valid node version', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stdout: 'v20.0.0' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkNodeVersion();
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('v20.0.0');
    });

    test('should return invalid for old node version', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stdout: 'v16.0.0' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkNodeVersion();
      expect(result.isValid).toBe(false);
      expect(result.version).toBe('v16.0.0');
    });

    test('should handle command error', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Command not found'));
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkNodeVersion();
      expect(result.isValid).toBe(false);
      expect(result.version).toBeNull();
    });
  });

  describe('checkCommand', () => {
    test('should return true for existing command', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stdout: '/usr/bin/node' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkCommand('node');
      expect(result).toBe(true);
    });

    test('should handle multiple fallback commands', async () => {
      const mockExec = jest.fn()
        .mockRejectedValueOnce(new Error('which failed'))
        .mockResolvedValueOnce({ stdout: '/usr/bin/node' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkCommand('node');
      expect(result).toBe(true);
    });

    test('should return false when command not found', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Command not found'));
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.checkCommand('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getCommandVersion', () => {
    test('should get version with v prefix', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stdout: 'v1.2.3\n' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.getCommandVersion('test', '--version');
      expect(result).toBe('1.2.3');
    });

    test('should get version without v prefix', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stdout: '1.2.3\n' });
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.getCommandVersion('test', '--version');
      expect(result).toBe('1.2.3');
    });

    test('should handle version command error', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Command failed'));
      jest.mocked(require('util').promisify).mockReturnValue(mockExec);

      const result = await SystemUtils.getCommandVersion('test', '--version');
      expect(result).toBeNull();
    });
  });

  describe('checkGlobalPackage', () => {
    test('should return true for installed package', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event: string, callback: (code: number) => void) => {
          if (event === 'close') callback(0);
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.checkGlobalPackage('test-package');
      expect(result).toBe(true);
    });

    test('should return false for missing package', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event: string, callback: (code: number) => void) => {
          if (event === 'close') callback(1);
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.checkGlobalPackage('test-package');
      expect(result).toBe(false);
    });

    test('should handle npm command error', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event: string, callback: (error: Error) => void) => {
          if (event === 'error') callback(new Error('npm not found'));
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.checkGlobalPackage('test-package');
      expect(result).toBe(false);
    });
  });
});