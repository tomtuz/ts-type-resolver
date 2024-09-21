import type * as ts from 'typescript'
import { isPrettifyRequest } from './request.js';
import type { PrettifyCompletionsTriggerCharacter, PrettifyResponse } from './request.js';
import { getTypeInfoAtPosition } from './type-tree';

function init(modules: { typescript: typeof import('typescript') }): ts.server.PluginModule {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    // Log a message
    info.project.projectService.logger.info('Prettify LSP is starting');

    // Set up decorator object
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k];
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: unknown[]) => x?.apply(info.languageService, args);
    }

    /**
     * Override getCompletionsAtPosition to provide prettify type information
     */

    const program = proxy.getProgram();

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const requestBody = options?.triggerCharacter as PrettifyCompletionsTriggerCharacter;
      if (!isPrettifyRequest(requestBody)) {
        return info.languageService.getCompletionsAtPosition(fileName, position, options);
      }

      const sourceFile = program?.getSourceFile(fileName)

      if (!program) return undefined;
      if (!sourceFile) return undefined;

      const checker = program.getTypeChecker();

      const prettifyResponse = getTypeInfoAtPosition(ts, checker, sourceFile, position, requestBody.options);

      const response: PrettifyResponse = {
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        entries: [],
        __prettifyResponse: prettifyResponse
      };

      return response;
    };

    return proxy;
  }

  return { create };
}

export default init;
