"use client";

import {
  createFortyTwoStore,
  initFortyTwoStore,
  type FortyTwoStore,
  type FortyTwoStoreInitProps,
} from "@/stores/forty-two-store";
import { createContext, useContext, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";

export const FortyTwoStoreContext =
  createContext<StoreApi<FortyTwoStore> | null>(null);

export interface FortyTwoStoreProviderProps extends FortyTwoStoreInitProps {
  children: ReactNode;
}

const store = createFortyTwoStore();

export const FortyTwoStoreProvider = ({
  cursus,
  levels,
  projects,
  titles,
  children,
}: FortyTwoStoreProviderProps) => {
  store.setState(initFortyTwoStore({ cursus, levels, projects, titles }));

  return (
    <FortyTwoStoreContext.Provider value={store}>
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

export { store as fortyTwoStore };
