/** Preserve the existing SDK API while avoiding construction at module import. */
export function lazyClient<T extends object>(create: () => T, check: () => void): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, property) {
      check();
      instance ??= create();
      const value = Reflect.get(instance, property);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}
