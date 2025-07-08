export function moneyRupiah(e: string): string {
  return e.replace(/[^\d]/g, '')
}
