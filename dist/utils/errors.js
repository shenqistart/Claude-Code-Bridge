"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ProviderError = exports.SystemRequirementError = exports.ConfigurationError = exports.InstallationError = exports.CCBError = void 0;
class CCBError extends Error {
    constructor(message, code, exitCode = 1) {
        super(message);
        this.code = code;
        this.exitCode = exitCode;
        this.name = 'CCBError';
    }
}
exports.CCBError = CCBError;
class InstallationError extends CCBError {
    constructor(message, cause) {
        super(message, 'INSTALLATION_ERROR');
        this.cause = cause;
    }
}
exports.InstallationError = InstallationError;
class ConfigurationError extends CCBError {
    constructor(message) {
        super(message, 'CONFIGURATION_ERROR');
    }
}
exports.ConfigurationError = ConfigurationError;
class SystemRequirementError extends CCBError {
    constructor(message) {
        super(message, 'SYSTEM_REQUIREMENT_ERROR');
    }
}
exports.SystemRequirementError = SystemRequirementError;
class ProviderError extends CCBError {
    constructor(message) {
        super(message, 'PROVIDER_ERROR');
    }
}
exports.ProviderError = ProviderError;
class ValidationError extends CCBError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR');
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map