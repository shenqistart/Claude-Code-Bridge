export declare class SystemUtils {
    static executeCommand(command: string, args?: string[]): Promise<{
        stdout: string;
        stderr: string;
    }>;
    static checkCommand(command: string): Promise<boolean>;
    static getCommandVersion(command: string, versionFlag?: string): Promise<string | null>;
    static checkNodeVersion(): Promise<{
        isValid: boolean;
        version: string | null;
    }>;
    static installGlobalPackage(packageName: string): Promise<void>;
    static updateGlobalPackage(packageName: string): Promise<void>;
    static uninstallGlobalPackage(packageName: string): Promise<void>;
    static checkGlobalPackage(packageName: string): Promise<boolean>;
}
//# sourceMappingURL=system.d.ts.map