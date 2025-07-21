import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
}

export class Logger {
  private static logFile = path.join(os.homedir(), '.claude', 'ccb.log');
  private static maxLogSize = 1024 * 1024; // 1MB
  private static maxLogFiles = 3;

  static async ensureLogDir(): Promise<void> {
    const logDir = path.dirname(this.logFile);
    await fs.ensureDir(logDir);
  }

  static async rotateLogIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFile);
      if (stats.size > this.maxLogSize) {
        // Rotate logs
        for (let i = this.maxLogFiles - 1; i >= 1; i--) {
          const oldFile = `${this.logFile}.${i}`;
          const newFile = `${this.logFile}.${i + 1}`;
          
          if (await fs.pathExists(oldFile)) {
            if (i === this.maxLogFiles - 1) {
              await fs.remove(oldFile);
            } else {
              await fs.move(oldFile, newFile);
            }
          }
        }
        
        await fs.move(this.logFile, `${this.logFile}.1`);
      }
    } catch {
      // If log file doesn't exist or we can't stat it, that's fine
    }
  }

  static async writeLog(entry: LogEntry): Promise<void> {
    try {
      await this.ensureLogDir();
      await this.rotateLogIfNeeded();
      
      const logLine = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;
      const detailsLine = entry.details ? `\nDetails: ${JSON.stringify(entry.details, null, 2)}` : '';
      
      await fs.appendFile(this.logFile, `${logLine}${detailsLine}\n`);
    } catch {
      // If we can't write logs, continue silently
    }
  }

  static createEntry(level: LogEntry['level'], message: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    };
  }

  static async info(message: string, details?: any): Promise<void> {
    const entry = this.createEntry('info', message, details);
    await this.writeLog(entry);
  }

  static async warning(message: string, details?: any): Promise<void> {
    const entry = this.createEntry('warning', message, details);
    await this.writeLog(entry);
  }

  static async error(message: string, details?: any): Promise<void> {
    const entry = this.createEntry('error', message, details);
    await this.writeLog(entry);
  }

  static async debug(message: string, details?: any): Promise<void> {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      const entry = this.createEntry('debug', message, details);
      await this.writeLog(entry);
    }
  }

  static async logCommand(command: string, args: any[]): Promise<void> {
    await this.info(`执行命令: ${command}`, { args });
  }

  static async logError(error: Error, context?: string): Promise<void> {
    await this.error(`错误: ${error.message}`, {
      context,
      stack: error.stack,
      name: error.name,
    });
  }

  static async getLogPath(): Promise<string> {
    return this.logFile;
  }
}