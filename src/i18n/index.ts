/**
 * i18n/index.ts — i18next initialization.
 *
 * Supports vi (Vietnamese, default) and en (English).
 * Uses expo-localization for device language detection.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './locales/en/translation.json'
import vi from './locales/vi/translation.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
}

const systemLocale = Localization.getLocales()?.[0]?.languageTag ?? 'vi'
const lng = systemLocale.startsWith('vi') ? 'vi' : 'en'

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false, // React already escapes
  },
  compatibilityJSON: 'v4',
})

export default i18n
