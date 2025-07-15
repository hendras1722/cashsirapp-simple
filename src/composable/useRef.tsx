'use client'

import { useState } from 'react'
import { useReactive } from './useComputed'

export default function useRef<T>(value: T) {
  const [setter, setSetter] = useState(value)
  return useReactive(
    () => setter,
    (newValue) => setSetter(newValue)
  )
}
