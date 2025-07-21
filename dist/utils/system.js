"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemUtils = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class SystemUtils {
    static async executeCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const process = (0, child_process_1.spawn)(command, args, { stdio: 'pipe' });
            let stdout = '';
            let stderr = '';
            process.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            process.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
                }
                else {
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });
            process.on('error', (error) => {
                reject(error);
            });
        });
    }
    static async checkCommand(command) {
        try {
            await execAsync(`which ${command}`);
            return true;
        }
        catch {
            try {
                await execAsync(`where ${command}`);
                return true;
            }
            catch {
                return false;
            }
        }
    }
    static async getCommandVersion(command, versionFlag = '--version') {
        try {
            const { stdout } = await execAsync(`${command} ${versionFlag}`);
            return stdout.trim();
        }
        catch {
            return null;
        }
    }
    static async checkNodeVersion() {
        try {
            const version = await this.getCommandVersion('node', '--version');
            if (!version)
                return { isValid: false, version: null };
            const versionNumber = version.replace('v', '');
            const majorVersion = parseInt(versionNumber.split('.')[0]);
            return {
                isValid: majorVersion >= 18,
                version
            };
        }
        catch {
            return { isValid: false, version: null };
        }
    }
    static async installGlobalPackage(packageName) {
        await this.executeCommand('npm', ['install', '-g', packageName]);
    }
    static async updateGlobalPackage(packageName) {
        await this.executeCommand('npm', ['update', '-g', packageName]);
    }
    static async uninstallGlobalPackage(packageName) {
        await this.executeCommand('npm', ['uninstall', '-g', packageName]);
    }
    static async checkGlobalPackage(packageName) {
        try {
            await this.executeCommand('npm', ['list', '-g', packageName, '--depth=0']);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.SystemUtils = SystemUtils;
//# sourceMappingURL=system.js.map