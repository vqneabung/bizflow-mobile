/**
 * Dashboard — Trang chính sau khi login.
 *
 * Hiển thị: thông tin user + stats cards (giống Next.js dashboard).
 */
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'

const stats = [
  { icon: '💰', label: "Today's Revenue", value: '—' },
  { icon: '📦', label: "Today's Orders", value: '—' },
  { icon: '📋', label: 'Customer Debt', value: '—' },
  { icon: '📊', label: 'Stock Items', value: '—' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User info card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>{user?.role}</Text>
        </View>
      </View>

      {/* Stats cards */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 16 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  userEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  userRole: { fontSize: 11, color: '#7c3aed', marginTop: 2, textTransform: 'uppercase' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
})
