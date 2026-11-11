import { registerHooks } from 'node:module';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';

const sourceRoot = path.resolve('src');
const nextEntries = new Set(['next/server', 'next/link', 'next/navigation', 'next/image']);
function resolveFile(base) {
  const explicit = /\.(?:[cm]?js|tsx?|json)$/.test(base);
  const candidates = explicit ? [base] : [base, base + '.ts', base + '.tsx', path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find(candidate => {
    try { return statSync(candidate).isFile(); }
    catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
      throw error;
    }
  });
}
registerHooks({
  resolve(specifier, context, next) {
    if (nextEntries.has(specifier)) return next(specifier + '.js', context);
    if (specifier === 'server-only') return { url: 'data:text/javascript,export{}', shortCircuit: true };
    if (specifier.startsWith('@/')) {
      const base = path.resolve(sourceRoot, specifier.slice(2));
      const relative = path.relative(sourceRoot, base);
      if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
        throw new Error('Test alias must stay inside src');
      }
      const file = resolveFile(base);
      if (file) return next(pathToFileURL(file).href, context);
    }
    if (/\.tsx?$/.test(context.parentURL || '') && specifier.startsWith('.')) {
      const file = resolveFile(fileURLToPath(new URL(specifier, context.parentURL)));
      if (file) return next(pathToFileURL(file).href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('file:') && /\.tsx?$/.test(url) && !url.includes('/node_modules/')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
    };
    return next(url, context);
  },
});
