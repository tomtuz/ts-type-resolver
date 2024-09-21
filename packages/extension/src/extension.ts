import type vscode from 'vscode'
import { registerHoverProvider } from './hover-provider'

import ts from 'typescript';
console.log(ts.version);

export function activate (context: vscode.ExtensionContext): void {
  registerHoverProvider(context)
}

