/**
 * dashboard/customer/index.tsx — Customer list screen.
 *
 * FlatList cards + search bar + FAB "Create" + pull-to-refresh.
 * Uses react-query for data fetching.
 */
import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useCustomersQuery } from '@/hooks/use-customers'
import type { CustomerResponse } from '@/types/customer'

export default function CustomerList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch, isFetching } =
    useCustomersQuery({ search: search || undefined, page, size: 20 })

  const customers = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  const handleCustomerPress = (id: string) => {
    router.push(`/dashboard/customer/${id}` as Href)
  }

  const handleCreate = () => {
    router.push('/dashboard/customer/create' as Href)
  }

  const handleLoadMore = () => {
    if (isFetching || page >= totalPages) return
    setPage((p) => p + 1)
  }

  /** Render one customer card */
  const renderCustomer = ({ item }: { item: CustomerResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCustomerPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        {!item.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactive</Text>
          </View>
        )}
      </View>

      {item.phone && <Text style={styles.cardSub}>📞 {item.phone}</Text>}
      {item.email && <Text style={styles.cardSub}>✉️ {item.email}</Text>}

      <View style={styles.cardFooter}>
        <Text style={styles.debtLabel}>
          Debt:{' '}
          <Text style={item.totalDebt > 0 ? styles.debtNegative : styles.debtZero}>
            {item.totalDebt.toLocaleString()} đ
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  )

  /** Empty state */
  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No customers</Text>
        <Text style={styles.emptySub}>
          {search
            ? 'Try adjusting your search'
            : 'Tap + to add your first customer'}
        </Text>
      </View>
    )
  }

  /** Error state */
  if (isError && customers.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>
          {(error as any)?.message || 'Failed to load customers'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={(v) => {
            setSearch(v)
            setPage(1)
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Loading */}
      {isLoading && customers.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#7c3aed"
          style={{ marginTop: 60 }}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomer}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={customers.length === 0 ? { flex: 1 } : undefined}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1}
              onRefresh={() => {
                setPage(1)
                refetch()
              }}
              tintColor="#7c3aed"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator
                color="#7c3aed"
                style={{ padding: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* FAB — Create Customer */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Search
  searchRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  inactiveText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  cardSub: { fontSize: 12, color: '#888', marginTop: 2 },
  cardFooter: { marginTop: 8 },
  debtLabel: { fontSize: 13, color: '#555' },
  debtNegative: { color: '#dc2626', fontWeight: '600' },
  debtZero: { color: '#22c55e', fontWeight: '600' },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4 },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: { fontSize: 36, marginBottom: 12 },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
})
