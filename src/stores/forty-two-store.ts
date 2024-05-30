import { FortyTwoLevel, FortyTwoProject } from '@/types/forty-two'
import { createStore } from 'zustand/vanilla'

export type FortyTwoState = {
  levels: Record<number, FortyTwoLevel>
  projects: Record<number, FortyTwoProject>
}

export type FortyTwoStore = FortyTwoState

export type FortyTwoStoreInitProps = {
  levels: Record<number, FortyTwoLevel>
  projects: Record<number, FortyTwoProject>
}

export const initFortyTwoStore = ({
  levels,
  projects
}: FortyTwoStoreInitProps): FortyTwoState => {
  return {
    levels,
    projects
  }
}

export const defaultInitState: FortyTwoState = {
  levels: {},
  projects: {}
}

export const createFortyTwoStore = (
  initState: FortyTwoState = defaultInitState
) => {
  return createStore<FortyTwoStore>()(() => ({
    ...initState
  }))
}
