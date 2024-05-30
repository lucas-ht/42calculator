'use client'

import {
  createCalculatorStore,
  initCalculatorStore,
  type CalculatorStore,
  type CalculatorStoreInitProps
} from '@/stores/calculator-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore, type StoreApi } from 'zustand'

export const CalculatorStoreContext =
  createContext<StoreApi<CalculatorStore> | null>(null)

export interface CalculatorStoreProviderProps extends CalculatorStoreInitProps {
  children: ReactNode
}

export const CalculatorStoreProvider = ({
  level,
  children
}: CalculatorStoreProviderProps) => {
  const storeRef = useRef<StoreApi<CalculatorStore>>()
  if (!storeRef.current) {
    storeRef.current = createCalculatorStore(initCalculatorStore({ level }))
  }

  return (
    <CalculatorStoreContext.Provider value={storeRef.current}>
      {children}
    </CalculatorStoreContext.Provider>
  )
}

export const useCalculatorStore = <T,>(
  selector: (store: CalculatorStore) => T
): T => {
  const calculatorStoreContext = useContext(CalculatorStoreContext)

  if (!calculatorStoreContext) {
    throw new Error(
      `useCalculatorStore must be use within CalculatorStoreProvider`
    )
  }

  return useStore(calculatorStoreContext, selector)
}
