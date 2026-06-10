/**
 * Profile — Thông tin tài khoản + nút logout.
 *
 * Sử dụng Zustand useAuthStore thay vì AuthContext.
 * Thêm nút Logout để người dùng có thể chủ động đăng xuất.
 */
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores'
import { logoutUser } from '@/services/auth'

export default function Profile() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logoutUser()
            // logoutUser tự clearSession() → AuthGuard redirect về login
          },
        },
      ],
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
        <View style={styles.divider} />

        <InfoRow label={t('profile.email')} value={user?.email} />
        <InfoRow label={t('profile.role')} value={user?.role} />
        <InfoRow label={t('profile.name')} value={user?.name ?? '—'} />
      </View>

      {/* Logout button */}
      {/* Settings link */}
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => router.push('/(app)/settings')}
      >
        <Text style={styles.settingsText}>⚙️ {t('profile.settings')}</Text>
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },

  // Settings
  settingsBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  settingsText: { color: '#7c3aed', fontSize: 15, fontWeight: '600' },

  // Logout
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
})
