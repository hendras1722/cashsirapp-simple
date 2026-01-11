import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface InputCurrencyProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number | string
  onValueChange?: (value: number) => void
  prefix?: string
}

export function InputCurrency({
  value,
  onValueChange,
  prefix = "Rp ",
  className,
  ...props
}: InputCurrencyProps) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { color, ...restProps } = props
  const [displayValue, setDisplayValue] = useState("")

  const formatCurrency = (num: number) => {
    return (
      prefix + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    )
  }

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const num = typeof value === "number" ? value : Number(value)
      if (!Number.isNaN(num))
        setDisplayValue(formatCurrency(num))
    }
  }, [value])

  const parseNumber = (str: string) => {
    const cleaned = str.replace(/\D/g, "")
    return Number(cleaned) || 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const parsed = parseNumber(raw)

    setDisplayValue(formatCurrency(parsed))
    onValueChange?.(parsed)
  }

  return (
    <Input
      {...restProps}
      value={displayValue}
      onChange={handleChange}
      className={cn("font-normal", className)}
    />
  )
}
