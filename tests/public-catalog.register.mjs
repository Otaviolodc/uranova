import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';

// Separate TSX loader: the existing financial test loader is left untouched.
registerHooks({
  resolve(specifier, context, next) {
    let base;
    if (specifier.startsWith('@/')) base = pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}`).href;
    else if (specifier.startsWith('.') && /\.tsx?$/.test(context.parentURL || '') && !/\.[a-z]+$/.test(specifier)) base = new URL(specifier, context.parentURL).href;
    if (base) {
      const url = ['.ts', '.tsx'].map((extension) => base + extension).find((candidate) => existsSync(fileURLToPath(candidate)));
      if (url) return { url, shortCircuit: true };
    }
    if (specifier === 'next/image' || specifier === 'next/link') return next(`${specifier}.js`, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (/\.tsx?$/.test(url) && !url.includes('/node_modules/')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
    };
    return next(url, context);
  },
});
