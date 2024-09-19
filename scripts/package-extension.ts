// @ts-nocheck
import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LogColors {
  info: any;
  success: any;
  error: any;
  warning: any;
}

const log = (message: string, type: keyof LogColors = 'info'): void => {
  const colors: LogColors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
  };
  console.log(colors[type](`[${type.toUpperCase()}] ${message}`));
};

const packageExtension = async (): Promise<void> => {
  try {
    const extensionPath = path.resolve(__dirname, '../packages/vscode-extension-new');
    const pluginPath = path.resolve(__dirname, '../packages/typescript-plugin');
    const pluginDest = path.join(
      extensionPath,
      'node_modules/@prettify-ts/typescript-plugin'
    );

    log('Copying built plugin to extension\'s node_modules...');
    await fs.copy(path.join(pluginPath, 'out'), path.join(pluginDest, 'out'));
    await fs.copy(
      path.join(pluginPath, 'package.json'),
      path.join(pluginDest, 'package.json')
    );
    log('Plugin copied successfully', 'success');

    log('Running vsce package...');
    execSync('vsce package --no-dependencies', { cwd: extensionPath, stdio: 'inherit' });
    log('Extension packaged successfully', 'success');
  } catch (error) {
    log(`An error occurred: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
};

packageExtension();
