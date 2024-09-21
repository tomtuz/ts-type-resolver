import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = path.resolve(__dirname, '..', 'packages');
const logDir = path.resolve(__dirname, '..', 'logs');

async function ensureLogDir() {
    await fs.mkdir(logDir, { recursive: true });
}

async function logToFile(filename, content) {
    await fs.appendFile(path.join(logDir, filename), `${content}\n`);
}

function execPromise(command, options, timeout = 300000) {
    return new Promise((resolve, reject) => {
        const child = exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });

        const timer = setTimeout(() => {
            child.kill();
            reject(new Error(`Command timed out after ${timeout / 1000} seconds: ${command}`));
        }, timeout);

        child.on('close', () => clearTimeout(timer));
    });
}

async function setupPackage(packagePath) {
    const packageName = path.basename(packagePath);
    const logFile = `${packageName}-setup.log`;

    try {
        await logToFile(logFile, `Setting up ${packageName}...`);

        // Install package dependencies
        const { stdout, stderr } = await execPromise('pnpm install --no-frozen-lockfile', { cwd: packagePath });
        await logToFile(logFile, stdout);
        if (stderr) await logToFile(logFile, `Warning: ${stderr}`);

        // Run setup-symlinks.js if it exists
        const symlinkScript = path.join(packagePath, 'setup-symlinks.js');
        try {
            await fs.access(symlinkScript);
            const { stdout: symlinkStdout, stderr: symlinkStderr } = await execPromise('node setup-symlinks.js', { cwd: packagePath });
            await logToFile(logFile, symlinkStdout);
            if (symlinkStderr) await logToFile(logFile, `Warning: ${symlinkStderr}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                await logToFile(logFile, `Error running setup-symlinks.js: ${error.message}`);
            }
        }

        await logToFile(logFile, `${packageName} setup complete`);
    } catch (error) {
        await logToFile(logFile, `Error setting up ${packageName}: ${error.message}`);
        if (error.stdout) await logToFile(logFile, `stdout: ${error.stdout}`);
        if (error.stderr) await logToFile(logFile, `stderr: ${error.stderr}`);
        throw error;
    }
}

async function setupWorkspace() {
    await ensureLogDir();
    const packages = await fs.readdir(packagesDir);
    
    for (const pkg of packages) {
        const packagePath = path.join(packagesDir, pkg);
        try {
            await setupPackage(packagePath);
            console.log(`${pkg} setup complete. See logs for details.`);
        } catch (error) {
            console.error(`Error setting up ${pkg}. See logs for details.`);
        }
    }
}

setupWorkspace().catch(error => {
    console.error('Workspace setup failed. See logs for details.');
    process.exit(1);
});
