import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'next/server') return next('next/server.js', context);
    if (specifier === 'server-only') return { url: 'data:text/javascript,export{}', shortCircuit: true };
    if (specifier.startsWith('@/')) {
      return { url: pathToFileURL(process.cwd() + '/src/' + specifier.slice(2) + '.ts').href, shortCircuit: true };
    }
    if (context.parentURL?.endsWith('.ts') && specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
      return { url: new URL(specifier + '.ts', context.parentURL).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts') && !url.includes('/node_modules/')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    };
    return next(url, context);
  },
});
