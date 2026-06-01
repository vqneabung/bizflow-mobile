/**
 * Profile — Thông tin tài khoản.
 */
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.divider} />

        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Role" value={user?.role} />
        <InfoRow label="Name" value={user?.name ?? '—'} />
      </View>
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
})
