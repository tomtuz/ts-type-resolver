import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

async function getPackagesFromWorkspaceYaml() {
    const yamlContent = await fs.readFile(path.join(workspaceRoot, 'pnpm-workspace.yaml'), 'utf8');
    const workspaceConfig = yaml.load(yamlContent);
    return workspaceConfig.packages || [];
}

async function findPackages(patterns) {
    const packages = [];
    for (const pattern of patterns) {
        if (pattern.endsWith('/*')) {
            const dir = path.join(workspaceRoot, pattern.slice(0, -2));
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    packages.push(path.join(dir, entry.name));
                }
            }
        } else {
            packages.push(path.join(workspaceRoot, pattern));
        }
    }
    return packages;
}

async function setupPackage(packagePath) {
    console.log(`Setting up ${path.basename(packagePath)}...`);
    try {
        // Install dependencies
        execSync('pnpm install', { 
            cwd: packagePath, 
            stdio: 'inherit' 
        });

        console.log(`Successfully set up ${path.basename(packagePath)}`);
        return true;
    } catch (error) {
        console.error(`Failed to set up ${path.basename(packagePath)}:`, error.message);
        await fs.appendFile(path.join(workspaceRoot, 'setup-error.log'), `${packagePath}: ${error.message}\n`);
        return false;
    }
}

async function setupWorkspace() {
    const packagePatterns = await getPackagesFromWorkspaceYaml();
    const packagePaths = await findPackages(packagePatterns);

    let succeededCount = 0;
    let failedCount = 0;

    for (const packagePath of packagePaths) {
        const success = await setupPackage(packagePath);
        if (success) succeededCount++; else failedCount++;
    }

    console.log(`Setup complete. Succeeded: ${succeededCount}, Failed: ${failedCount}`);
    if (failedCount > 0) {
        console.log('Check setup-error.log for details on failures.');
    }
}

setupWorkspace().catch(console.error);
