import { describe, test, expect } from '@jest/globals';
import {
  CCBError,
  InstallationError,
  ConfigurationError,
  SystemRequirementError,
  ProviderError,
  ValidationError
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('CCBError', () => {
    test('should create CCBError with message', () => {
      const error = new CCBError('Test error message');
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('CCBError');
      expect(error.exitCode).toBe(1);
      expect(error.code).toBeUndefined();
    });

    test('should create CCBError with code and exit code', () => {
      const error = new CCBError('Test error', 'TEST_CODE', 2);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.exitCode).toBe(2);
    });

    test('should be instance of Error', () => {
      const error = new CCBError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CCBError);
    });
  });

  describe('InstallationError', () => {
    test('should create InstallationError with message', () => {
      const error = new InstallationError('Installation failed');
      expect(error.message).toBe('Installation failed');
      expect(error.name).toBe('CCBError');
      expect(error.code).toBe('INSTALLATION_ERROR');
      expect(error.exitCode).toBe(1);
    });

    test('should create InstallationError with cause', () => {
      const cause = new Error('Original error');
      const error = new InstallationError('Installation failed', cause);
      expect(error.cause).toBe(cause);
    });

    test('should be instance of CCBError', () => {
      const error = new InstallationError('Test error');
      expect(error).toBeInstanceOf(CCBError);
      expect(error).toBeInstanceOf(InstallationError);
    });
  });

  describe('ConfigurationError', () => {
    test('should create ConfigurationError with correct code', () => {
      const error = new ConfigurationError('Config error');
      expect(error.message).toBe('Config error');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error).toBeInstanceOf(CCBError);
    });
  });

  describe('SystemRequirementError', () => {
    test('should create SystemRequirementError with correct code', () => {
      const error = new SystemRequirementError('System requirement not met');
      expect(error.message).toBe('System requirement not met');
      expect(error.code).toBe('SYSTEM_REQUIREMENT_ERROR');
      expect(error).toBeInstanceOf(CCBError);
    });
  });

  describe('ProviderError', () => {
    test('should create ProviderError with correct code', () => {
      const error = new ProviderError('Provider error');
      expect(error.message).toBe('Provider error');
      expect(error.code).toBe('PROVIDER_ERROR');
      expect(error).toBeInstanceOf(CCBError);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with correct code', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error).toBeInstanceOf(CCBError);
    });
  });
});