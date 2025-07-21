import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SystemUtils {
  static async executeCommand(command: string, args: string[] = []): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      
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
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  static async checkCommand(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch {
      try {
        await execAsync(`where ${command}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  static async getCommandVersion(command: string, versionFlag = '--version'): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`${command} ${versionFlag}`);
      return stdout.trim();
    } catch {
      return null;
    }
  }

  static async checkNodeVersion(): Promise<{ isValid: boolean; version: string | null }> {
    try {
      const version = await this.getCommandVersion('node', '--version');
      if (!version) return { isValid: false, version: null };
      
      const versionNumber = version.replace('v', '');
      const majorVersion = parseInt(versionNumber.split('.')[0]);
      
      return {
        isValid: majorVersion >= 18,
        version
      };
    } catch {
      return { isValid: false, version: null };
    }
  }

  static async installGlobalPackage(packageName: string): Promise<void> {
    await this.executeCommand('npm', ['install', '-g', packageName]);
  }

  static async updateGlobalPackage(packageName: string): Promise<void> {
    await this.executeCommand('npm', ['update', '-g', packageName]);
  }

  static async uninstallGlobalPackage(packageName: string): Promise<void> {
    await this.executeCommand('npm', ['uninstall', '-g', packageName]);
  }

  static async checkGlobalPackage(packageName: string): Promise<boolean> {
    try {
      await this.executeCommand('npm', ['list', '-g', packageName, '--depth=0']);
      return true;
    } catch {
      return false;
    }
  }
}