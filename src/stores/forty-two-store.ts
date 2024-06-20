import {
  FortyTwoLevel,
  FortyTwoProject,
  FortyTwoTitle
} from '@/types/forty-two'
import { createStore } from 'zustand/vanilla'

export type FortyTwoState = {
  levels: Record<number, FortyTwoLevel>
  projects: Record<number, FortyTwoProject>
  titles: Array<FortyTwoTitle>
}

export type FortyTwoStore = FortyTwoState

export type FortyTwoStoreInitProps = {
  levels?: Record<number, FortyTwoLevel>
  projects?: Record<number, FortyTwoProject>
  titles?: Array<FortyTwoTitle>
}

export const initFortyTwoStore = ({
  levels,
  projects,
  titles
}: FortyTwoStoreInitProps): FortyTwoState => {
  return {
    levels: levels ?? {},
    projects: projects ?? {},
    titles: titles ?? []
  }
}

export const defaultInitState: FortyTwoState = {
  levels: {},
  projects: {},
  titles: []
}

export const createFortyTwoStore = (
  initState: FortyTwoState = defaultInitState
) => {
  return createStore<FortyTwoStore>()(() => ({
    ...initState
  }))
}
