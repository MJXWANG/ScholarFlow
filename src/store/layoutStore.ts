import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  leftPanelWidth: number
  rightPanelWidth: number
  
  // Actions
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  resetLayout: () => void
}

const defaultLeftWidth = 300
const defaultRightWidth = 350

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      leftPanelWidth: defaultLeftWidth,
      rightPanelWidth: defaultRightWidth,

      setLeftPanelWidth: (width: number) => {
        set({ leftPanelWidth: Math.max(200, Math.min(600, width)) })
      },

      setRightPanelWidth: (width: number) => {
        set({ rightPanelWidth: Math.max(250, Math.min(700, width)) })
      },

      resetLayout: () => {
        set({
          leftPanelWidth: defaultLeftWidth,
          rightPanelWidth: defaultRightWidth
        })
      }
    }),
    {
      name: 'scholarflow-layout-storage',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
