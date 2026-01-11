/**
 * Check value is valid date
 * @param value - Value to check
 * @returns boolean
 */
export function isValidDate(value: any) {
  if (!value) {
    return false;
  }

  return Number.isNaN(new Date(value).valueOf());
}
