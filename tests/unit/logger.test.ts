import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { colors, log } from '../../src/utils/logger';

// Mock console methods
const mockConsole = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('Logger Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
  });

  describe('colors', () => {
    test('should format success message with checkmark', () => {
      const message = 'Test success';
      const result = colors.success(message);
      expect(result).toContain('✓');
      expect(result).toContain(message);
    });

    test('should format error message with cross mark', () => {
      const message = 'Test error';
      const result = colors.error(message);
      expect(result).toContain('✗');
      expect(result).toContain(message);
    });

    test('should format warning message with warning symbol', () => {
      const message = 'Test warning';
      const result = colors.warning(message);
      expect(result).toContain('⚠');
      expect(result).toContain(message);
    });

    test('should format info message with info symbol', () => {
      const message = 'Test info';
      const result = colors.info(message);
      expect(result).toContain('ℹ');
      expect(result).toContain(message);
    });

    test('should format progress message with arrow', () => {
      const message = 'Test progress';
      const result = colors.progress(message);
      expect(result).toContain('→');
      expect(result).toContain(message);
    });

    test('should format prompt message without symbol', () => {
      const message = 'Test prompt';
      const result = colors.prompt(message);
      expect(result).toContain(message);
    });
  });

  describe('log', () => {
    test('should log success message to console', () => {
      const message = 'Success test';
      log.success(message);
      expect(mockConsole.log).toHaveBeenCalledWith(colors.success(message));
    });

    test('should log error message to console.error', () => {
      const message = 'Error test';
      log.error(message);
      expect(mockConsole.error).toHaveBeenCalledWith(colors.error(message));
    });

    test('should log warning message to console', () => {
      const message = 'Warning test';
      log.warning(message);
      expect(mockConsole.log).toHaveBeenCalledWith(colors.warning(message));
    });

    test('should log info message to console', () => {
      const message = 'Info test';
      log.info(message);
      expect(mockConsole.log).toHaveBeenCalledWith(colors.info(message));
    });

    test('should log progress message to console', () => {
      const message = 'Progress test';
      log.progress(message);
      expect(mockConsole.log).toHaveBeenCalledWith(colors.progress(message));
    });

    test('should log plain message to console', () => {
      const message = 'Plain test';
      log.plain(message);
      expect(mockConsole.log).toHaveBeenCalledWith(message);
    });
  });
});