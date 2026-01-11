import { toArray } from "./toArray";

/**
 * Omit object by key
 * @param source - Source object
 * @param keys - Object keys to remove
 * @returns object
 */
export function omit<T extends object, Keys extends keyof T>(source: T, keys: Keys | Keys[]) {
  const filteredKeys = Object.keys(source).filter(
    (key) => !toArray(keys as string[], true).includes(key)
  );
  const result       = filteredKeys.reduce((prev: Record<string, any>, key) => {
    prev[key] = (source as any)[key];

    return prev;
  }, {});

  return result as Omit<T, Keys>;
}
