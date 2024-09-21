import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LogColors {
  info: (text: string) => string;
  success: (text: string) => string;
  error: (text: string) => string;
  warning: (text: string) => string;
}

const log = (message: string, type: keyof LogColors = 'info'): void => {
  const colors: LogColors = {
    info: pc.blue,
    success: pc.green,
    error: pc.red,
    warning: pc.yellow,
  };
  console.log(colors[type](`[${type.toUpperCase()}] ${message}`));
};

const packageExtension = async (): Promise<void> => {
  try {
    const extensionPath = path.resolve(__dirname, '../packages/extension');
    const pluginPath = path.resolve(__dirname, '../packages/plugin');
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
    execSync('vsce package --allow-missing-repository --skip-license -o ../dist', { cwd: extensionPath, stdio: 'inherit' });
    log('Extension packaged successfully', 'success');
  } catch (error) {
    log(`An error occurred: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
};

packageExtension();
