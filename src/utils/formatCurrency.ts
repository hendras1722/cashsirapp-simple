export interface CurrencyOptions {
  locale?: string
  prefix?: string
}

export function formatCurrency(value: number | string, options?: CurrencyOptions): string {
  if (isNaN(Number.parseFloat(String(value)))) {
    return "0"
  }

  const opt: Required<CurrencyOptions> = {
    locale: options?.locale ?? "id-ID",
    prefix: options?.prefix ?? "",
  }

  const formatter = new Intl.NumberFormat(opt.locale)
  const result = formatter.format(Number(value))

  return `${opt.prefix} ${result}`.trim()
}
