import './public-catalog.register.mjs';
import { registerHooks } from 'node:module';
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'next/navigation') return next('next/navigation.js', context);
    return next(specifier, context);
  },
});
