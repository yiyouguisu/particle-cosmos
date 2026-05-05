import { create } from 'zustand'
import type { MouseState, FormationState } from '../types'

const FORMATION_COUNT = 17

interface AppState {
  mouse: MouseState
  formation: FormationState
  audioEnabled: boolean

  setMousePosition: (x: number, y: number) => void
  setLongPress: (active: boolean) => void

  nextFormation: () => void
  prevFormation: () => void
  goToFormation: (index: number) => void
  setMorphProgress: (progress: number) => void
  togglePause: () => void
  resetAutoTimer: () => void

  toggleAudio: () => void
}

export const useStore = create<AppState>((set) => ({
  mouse: {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    velocity: 0,
    speed: 0,
    isLongPress: false,
    longPressStart: 0,
  },

  formation: {
    currentIndex: 0,
    targetIndex: 0,
    morphProgress: 1,
    paused: false,
  },

  audioEnabled: true,

  setMousePosition: (x: number, y: number) =>
    set((state) => {
      const dx = x - state.mouse.x
      const dy = y - state.mouse.y
      const velocity = Math.sqrt(dx * dx + dy * dy)
      return {
        mouse: {
          ...state.mouse,
          x,
          y,
          prevX: state.mouse.x,
          prevY: state.mouse.y,
          velocity,
          speed: velocity,
        },
      }
    }),

  setLongPress: (active: boolean) =>
    set((state) => ({
      mouse: {
        ...state.mouse,
        isLongPress: active,
        longPressStart: active ? Date.now() : state.mouse.longPressStart,
      },
    })),

  nextFormation: () =>
    set((state) => {
      const next = (state.formation.currentIndex + 1) % FORMATION_COUNT
      return {
        formation: {
          ...state.formation,
          targetIndex: next,
          morphProgress: 0,
        },
      }
    }),

  prevFormation: () =>
    set((state) => {
      const prev = (state.formation.currentIndex - 1 + FORMATION_COUNT) % FORMATION_COUNT
      return {
        formation: {
          ...state.formation,
          targetIndex: prev,
          morphProgress: 0,
        },
      }
    }),

  goToFormation: (index: number) =>
    set((state) => {
      if (index === state.formation.currentIndex) return state
      const target = ((index % FORMATION_COUNT) + FORMATION_COUNT) % FORMATION_COUNT
      return {
        formation: {
          ...state.formation,
          targetIndex: target,
          morphProgress: 0,
        },
      }
    }),

  setMorphProgress: (progress: number) =>
    set((state) => ({
      formation: {
        ...state.formation,
        morphProgress: Math.min(1, progress),
        currentIndex: progress >= 1 ? state.formation.targetIndex : state.formation.currentIndex,
      },
    })),

  togglePause: () =>
    set((state) => ({
      formation: { ...state.formation, paused: !state.formation.paused },
    })),

  resetAutoTimer: () => {
    // This is a signal; the actual timer lives in the component
  },

  toggleAudio: () =>
    set((state) => ({ audioEnabled: !state.audioEnabled })),
}))
