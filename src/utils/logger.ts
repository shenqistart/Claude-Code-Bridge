import chalk from 'chalk';

export const colors = {
  success: (text: string) => chalk.green(`✓ ${text}`),
  error: (text: string) => chalk.red(`✗ ${text}`),
  warning: (text: string) => chalk.yellow(`⚠ ${text}`),
  info: (text: string) => chalk.blue(`ℹ ${text}`),
  progress: (text: string) => chalk.cyan(`→ ${text}`),
  prompt: (text: string) => chalk.white(text),
};

export const log = {
  success: (message: string) => console.log(colors.success(message)),
  error: (message: string) => console.error(colors.error(message)),
  warning: (message: string) => console.log(colors.warning(message)),
  info: (message: string) => console.log(colors.info(message)),
  progress: (message: string) => console.log(colors.progress(message)),
  plain: (message: string) => console.log(message),
};