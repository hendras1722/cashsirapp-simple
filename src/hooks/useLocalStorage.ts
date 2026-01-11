import { useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined")
      return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    }
    catch {
      return initialValue
    }
  })

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue))
      }
    }

    const customHandler = (e: Event) => {
      const detail = (e as CustomEvent<T>).detail

      queueMicrotask(() => {
        setValue(detail)
      })
    }

    window.addEventListener("storage", handler)
    window.addEventListener(`${key}-updated`, customHandler)

    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener(`${key}-updated`, customHandler)
    }
  }, [key])

  const setStoredValue = (val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof val === "function" ? (val as any)(prev) : val
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })

    queueMicrotask(() => {
      const stored = localStorage.getItem(key)
      if (stored) {
        window.dispatchEvent(
          new CustomEvent(`${key}-updated`, {
            detail: JSON.parse(stored),
          }),
        )
      }
    })
  }

  return [value, setStoredValue] as const
}
