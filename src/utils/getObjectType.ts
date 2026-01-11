/**
 * Get object constructor type
 * @param value - Value to check
 * @returns string
 */
export function getObjectType(value: any) {
  return Object.prototype.toString
    .call(value)
    .replace(/^\[object (\S+)\]$/, "$1")
    .toLowerCase();
}
