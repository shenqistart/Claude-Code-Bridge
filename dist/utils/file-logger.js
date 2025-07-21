"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class Logger {
    static async ensureLogDir() {
        const logDir = path.dirname(this.logFile);
        await fs.ensureDir(logDir);
    }
    static async rotateLogIfNeeded() {
        try {
            const stats = await fs.stat(this.logFile);
            if (stats.size > this.maxLogSize) {
                for (let i = this.maxLogFiles - 1; i >= 1; i--) {
                    const oldFile = `${this.logFile}.${i}`;
                    const newFile = `${this.logFile}.${i + 1}`;
                    if (await fs.pathExists(oldFile)) {
                        if (i === this.maxLogFiles - 1) {
                            await fs.remove(oldFile);
                        }
                        else {
                            await fs.move(oldFile, newFile);
                        }
                    }
                }
                await fs.move(this.logFile, `${this.logFile}.1`);
            }
        }
        catch {
        }
    }
    static async writeLog(entry) {
        try {
            await this.ensureLogDir();
            await this.rotateLogIfNeeded();
            const logLine = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;
            const detailsLine = entry.details ? `\nDetails: ${JSON.stringify(entry.details, null, 2)}` : '';
            await fs.appendFile(this.logFile, `${logLine}${detailsLine}\n`);
        }
        catch {
        }
    }
    static createEntry(level, message, details) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            details,
        };
    }
    static async info(message, details) {
        const entry = this.createEntry('info', message, details);
        await this.writeLog(entry);
    }
    static async warning(message, details) {
        const entry = this.createEntry('warning', message, details);
        await this.writeLog(entry);
    }
    static async error(message, details) {
        const entry = this.createEntry('error', message, details);
        await this.writeLog(entry);
    }
    static async debug(message, details) {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            const entry = this.createEntry('debug', message, details);
            await this.writeLog(entry);
        }
    }
    static async logCommand(command, args) {
        await this.info(`执行命令: ${command}`, { args });
    }
    static async logError(error, context) {
        await this.error(`错误: ${error.message}`, {
            context,
            stack: error.stack,
            name: error.name,
        });
    }
    static async getLogPath() {
        return this.logFile;
    }
}
exports.Logger = Logger;
Logger.logFile = path.join(os.homedir(), '.claude', 'ccb.log');
Logger.maxLogSize = 1024 * 1024;
Logger.maxLogFiles = 3;
//# sourceMappingURL=file-logger.js.map