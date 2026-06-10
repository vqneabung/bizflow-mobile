/**
 * settings.tsx — Cài đặt ứng dụng.
 *
 * Cho phép user chọn ngôn ngữ: Theo thiết bị / Tiếng Việt / English
 */
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSettingsStore, type LangPref } from '@/stores/settings-store'

export default function Settings() {
  const { t } = useTranslation()
  const { languagePref, setLanguagePref } = useSettingsStore()

  const options: { key: LangPref; label: string }[] = [
    { key: 'auto', label: t('settings.languageAuto') },
    { key: 'vi', label: t('settings.languageVi') },
    { key: 'en', label: t('settings.languageEn') },
  ]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.divider} />
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionRow}
            onPress={() => setLanguagePref(opt.key)}
          >
            <Text
              style={[
                styles.optionText,
                languagePref === opt.key && styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
            <View
              style={[
                styles.radio,
                languagePref === opt.key && styles.radioActive,
              ]}
            >
              {languagePref === opt.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: { fontSize: 15, color: '#333' },
  optionTextActive: { color: '#7c3aed', fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#7c3aed' },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7c3aed',
  },
})
