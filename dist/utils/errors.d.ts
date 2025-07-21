export declare class CCBError extends Error {
    code?: string | undefined;
    exitCode: number;
    constructor(message: string, code?: string | undefined, exitCode?: number);
}
export declare class InstallationError extends CCBError {
    cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class ConfigurationError extends CCBError {
    constructor(message: string);
}
export declare class SystemRequirementError extends CCBError {
    constructor(message: string);
}
export declare class ProviderError extends CCBError {
    constructor(message: string);
}
export declare class ValidationError extends CCBError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map