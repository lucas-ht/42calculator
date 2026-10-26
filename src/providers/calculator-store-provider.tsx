"use client";

import {
  createCalculatorStore,
  initCalculatorStore,
  type CalculatorStore,
} from "@/stores/calculator-store";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";

export const CalculatorStoreContext =
  createContext<StoreApi<CalculatorStore> | null>(null);

export interface CalculatorStoreProviderProps {
  children: ReactNode;
}

export const CalculatorStoreProvider = ({
  children,
}: CalculatorStoreProviderProps) => {
  // Read the static 42 data via a hook here (unconditionally) rather than
  // inside the store factory, where it would only run on the first render and
  // break the Rules of Hooks ("Rendered fewer hooks than expected").
  const {
    cursus: { level },
    levels,
  } = useFortyTwoStore((state) => state);

  const storeRef = useRef<StoreApi<CalculatorStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createCalculatorStore(
      initCalculatorStore(level, levels),
      levels,
    );
  }

  return (
    <CalculatorStoreContext.Provider value={storeRef.current}>
      {children}
    </CalculatorStoreContext.Provider>
  );
};

export const useCalculatorStore = <T,>(
  selector: (store: CalculatorStore) => T,
): T => {
  const calculatorStoreContext = useContext(CalculatorStoreContext);

  if (!calculatorStoreContext) {
    throw new Error(
      "useCalculatorStore must be use within CalculatorStoreProvider",
    );
  }

  return useStore(calculatorStoreContext, selector);
};
