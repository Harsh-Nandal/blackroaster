import { useState, useEffect } from 'react'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = (newValue) => {
    const toStore = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(toStore)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(toStore))
      } catch {}
    }
  }

  return [value, setStoredValue]
}
