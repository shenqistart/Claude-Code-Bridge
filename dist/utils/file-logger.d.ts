export interface LogEntry {
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    details?: any;
}
export declare class Logger {
    private static logFile;
    private static maxLogSize;
    private static maxLogFiles;
    static ensureLogDir(): Promise<void>;
    static rotateLogIfNeeded(): Promise<void>;
    static writeLog(entry: LogEntry): Promise<void>;
    static createEntry(level: LogEntry['level'], message: string, details?: any): LogEntry;
    static info(message: string, details?: any): Promise<void>;
    static warning(message: string, details?: any): Promise<void>;
    static error(message: string, details?: any): Promise<void>;
    static debug(message: string, details?: any): Promise<void>;
    static logCommand(command: string, args: any[]): Promise<void>;
    static logError(error: Error, context?: string): Promise<void>;
    static getLogPath(): Promise<string>;
}
//# sourceMappingURL=file-logger.d.ts.map