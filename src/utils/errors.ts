export class CCBError extends Error {
  constructor(
    message: string,
    public code?: string,
    public exitCode: number = 1
  ) {
    super(message);
    this.name = 'CCBError';
  }
}

export class InstallationError extends CCBError {
  constructor(message: string, public cause?: Error) {
    super(message, 'INSTALLATION_ERROR');
  }
}

export class ConfigurationError extends CCBError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

export class SystemRequirementError extends CCBError {
  constructor(message: string) {
    super(message, 'SYSTEM_REQUIREMENT_ERROR');
  }
}

export class ProviderError extends CCBError {
  constructor(message: string) {
    super(message, 'PROVIDER_ERROR');
  }
}

export class ValidationError extends CCBError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}