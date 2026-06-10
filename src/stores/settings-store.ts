/**
 * settings-store.ts — Zustand store cho app settings.
 *
 * Quản lý language preference (auto/vi/en), persist trong SecureStore.
 * Cho phép user override device locale.
 */
import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import i18n from '@/i18n'

export type LangPref = 'auto' | 'vi' | 'en'

const STORAGE_KEY = 'app_language'

interface SettingsState {
  languagePref: LangPref
  isLoading: boolean
  init: () => Promise<void>
  setLanguagePref: (pref: LangPref) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  languagePref: 'auto',
  isLoading: true,

  init: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY) as LangPref | null
      const pref = stored ?? 'auto'
      if (pref !== 'auto') {
        await i18n.changeLanguage(pref)
      } else {
        // Reset về device locale
        const { getLocales } = await import('expo-localization')
        const device = getLocales()?.[0]?.languageTag ?? 'vi'
        await i18n.changeLanguage(device.startsWith('vi') ? 'vi' : 'en')
      }
      set({ languagePref: pref, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setLanguagePref: async (pref: LangPref) => {
    if (pref === 'auto') {
      await SecureStore.deleteItemAsync(STORAGE_KEY)
      const { getLocales } = await import('expo-localization')
      const device = getLocales()?.[0]?.languageTag ?? 'vi'
      await i18n.changeLanguage(device.startsWith('vi') ? 'vi' : 'en')
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, pref)
      await i18n.changeLanguage(pref)
    }
    set({ languagePref: pref })
  },
}))
