import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  backgroundImage: string
  setBackgroundImage: (url: string) => void
  resetBackgroundImage: () => void
}

const DEFAULT_BACKGROUND = '/images/shutter-speed-3LXPDYb83MY-unsplash.jpg'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      backgroundImage: DEFAULT_BACKGROUND,
      setBackgroundImage: (url: string) => set({ backgroundImage: url }),
      resetBackgroundImage: () => set({ backgroundImage: DEFAULT_BACKGROUND }),
    }),
    {
      name: 'priority-metrix-settings',
    }
  )
)
