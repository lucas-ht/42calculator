"use client";

import {
  type FortyTwoStore,
  type FortyTwoStoreInitProps,
  createFortyTwoStore,
  initFortyTwoStore,
} from "@/stores/forty-two-store";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { type StoreApi, useStore } from "zustand";

export const FortyTwoStoreContext =
  createContext<StoreApi<FortyTwoStore> | null>(null);

export interface FortyTwoStoreProviderProps extends FortyTwoStoreInitProps {
  children: ReactNode;
}

export const FortyTwoStoreProvider = ({
  cursus,
  levels,
  projects,
  titles,
  children,
}: FortyTwoStoreProviderProps) => {
  const storeRef = useRef<StoreApi<FortyTwoStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createFortyTwoStore(
      initFortyTwoStore({ cursus, levels, projects, titles }),
    );
  }

  return (
    <FortyTwoStoreContext.Provider value={storeRef.current}>
      {children}
    </FortyTwoStoreContext.Provider>
  );
};

export const useFortyTwoStore = <T,>(
  selector: (store: FortyTwoStore) => T,
): T => {
  const fortyTwoStoreContext = useContext(FortyTwoStoreContext);

  if (!fortyTwoStoreContext) {
    throw new Error(
      "useFortyTwoStore must be use within FortyTwoStoreProvider",
    );
  }

  return useStore(fortyTwoStoreContext, selector);
};
