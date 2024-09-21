const fs = require('node:fs').promises;
const path = require('node:path');

const packageRoot = path.resolve(__dirname);
const workspaceRoot = path.resolve(packageRoot, '..', '..');

async function readPackageJson(path) {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
}

async function findPnpmPackage(pkg, version) {
    const pnpmDir = path.join(workspaceRoot, 'node_modules', '.pnpm');
    const files = await fs.readdir(pnpmDir);
    
    // Remove the caret from the version if it exists
    const cleanVersion = version.replace(/^\^/, '');
    
    const pkgDir = files.find(f => {
        const [name, ver] = f.split('@');
        return name === pkg && ver.startsWith(cleanVersion);
    });

    if (!pkgDir) {
        console.error("Available packages in .pnpm:", files);
        throw new Error(`Cannot find pnpm package for ${pkg}@${version}`);
    }
    return path.join(pnpmDir, pkgDir, 'node_modules', pkg);
}

async function symlinkPackages() {
    const packageJson = await readPackageJson(path.join(packageRoot, 'package.json'));
    const dependencies = { 
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    for (const [pkg, version] of Object.entries(dependencies)) {
        if (version.startsWith('workspace:')) continue; // Skip workspace dependencies

        try {
            const sourcePath = await findPnpmPackage(pkg, version);
            const targetPath = path.join(packageRoot, 'node_modules', pkg);

            // Ensure the target directory exists
            await fs.mkdir(path.dirname(targetPath), { recursive: true });

            // Check if the target already exists
            try {
                const stats = await fs.lstat(targetPath);
                if (stats.isSymbolicLink()) {
                    await fs.unlink(targetPath);
                }
            } catch (error) {
                // Target doesn't exist, which is fine
            }

            // Create the symlink
            await fs.symlink(sourcePath, targetPath, 'junction');
            console.log(`Symlinked ${pkg} from ${sourcePath} to ${targetPath}`);
        } catch (error) {
            console.error(`Failed to symlink ${pkg}: ${error.message}`);
        }
    }
}

symlinkPackages()
    .then(() => console.log('Symlinking complete'))
    .catch(error => console.error('Symlinking failed:', error));
