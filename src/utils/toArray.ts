/**
 * Set data as array
 * @param value - Value to check
 * @param keepAssign - Force assign to array if not undefined
 * @returns array
 */
export function toArray<T>(value: T | T[], keepAssign: boolean = false): NonNullable<T>[] {
  return Array.isArray(value) ? [...(value as any)] : keepAssign ? [value!] : [];
}
