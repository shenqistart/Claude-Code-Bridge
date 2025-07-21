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
          if (event === 'close') callback(0); // 改为成功代码以避免reject
        })
      };

      jest.mocked(require('child_process').spawn).mockReturnValue(mockProcess as any);

      const result = await SystemUtils.executeCommand('test', []);
      expect(result.stderr).toBe('error message');
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