# Prettify TypeScript
## Scripts

This project provides several Yarn scripts that you can use to manage the development process:

- `yarn install`: Installs all the dependencies for the project. This command should be run after cloning the repository or whenever a new package is added to the `package.json` file.

- `yarn build`: Compiles the TypeScript code in the project. This command should be run before testing the extension or preparing it for distribution.

- `yarn package`: Packages the Visual Studio Code extension for distribution. This command should be run when you're ready to create a `.vsix` file that can be installed in Visual Studio Code.

You can run these commands from the terminal in the root directory of the project.

## Development and Debugging

In the `.vscode/launch.json` file, we have:

- **Run Extension**: Starts a new VS Code instance with the extension loaded. It runs the "build root" task before launching and allows attaching a debugger to the VSCode extension code.

- **Attach to TSServer**: Attaches the debugger to the TypeScript server running in the extension's context. Use this to debug the TypeScript server's Language Service Plugin.

You can execute these tasks in Visual Studio Code by navigating to the Run view (View > Run), selecting the desired task from the dropdown menu, and pressing the green play button.

## Monorepo Structure

This project is organized as a monorepo, meaning it hosts multiple packages within a single repository. Yarn is required for it's advanced monorepo customizability, specifically it's `nohoist` functionality.

### Packages

The monorepo includes the following packages:

- `vscode-extension`: This package is the Visual Studio Code extension that integrates the TypeScript Plugin into the editor. It provides the user interface for interacting with Prettify TS.

- `typescript-plugin`: This package is a TypeScript language service plugin. It enhances the TypeScript language service with the capabilities of Prettify TS.

### Nohoist and Packaging

In this monorepo, we use Yarn's `nohoist` option for the packages. This is necessary because the Visual Studio Code extension packaging tool (`vsce`) expects all of the extension's dependencies to be located directly in the extension's `node_modules` directory.

Nohoist allows specific dependencies to avoid being hoisted to the root `node_modules` directory, which is the default behavior in a Yarn workspace. Instead, these dependencies are installed directly into the `node_modules` directory of the package that depends on them.

## Roadmap / To-Do

1. Show/Hide Private Properties setting
2. Show/Hide default TS previews (explore moving completely over to overriding)
3. Svelte Support
4. JetBrains Extension
