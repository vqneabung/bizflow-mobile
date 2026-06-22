/**
 * dashboard/order/index.tsx — Order list screen.
 *
 * FlatList cards + status filter pills + pull-to-refresh + load more.
 * FAB "Create" routes to /dashboard/order/create.
 */
import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useOrdersQuery } from '@/hooks/use-orders'
import type { OrderStatus, OrderSummaryResponse } from '@/types/order'

type StatusFilter = '' | OrderStatus

const STATUS_PILLS: StatusFilter[] = ['', 'DRAFT', 'CONFIRMED', 'CANCELLED']

const formatVND = (n: number): string => `${n.toLocaleString()} đ`

export default function OrderList() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const statusParam: OrderStatus | undefined =
    statusFilter === '' ? undefined : statusFilter

  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrdersQuery({ page, size: 20, status: statusParam })

  const orders = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  const handleOrderPress = (id: string) => {
    router.push(`/dashboard/order/${id}` as Href)
  }

  const handleCreate = () => {
    router.push('/dashboard/order/create' as Href)
  }

  const handleLoadMore = () => {
    if (isFetching || page >= totalPages) return
    setPage((p) => p + 1)
  }

  const handleFilterChange = (next: StatusFilter) => {
    setStatusFilter(next)
    setPage(1)
  }

  /** Render one order card */
  const renderOrder = ({ item }: { item: OrderSummaryResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOrderPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardRef} numberOfLines={1}>
          {item.referenceNumber}
        </Text>
        <View style={[styles.statusBadge, badgeStyle(item.status)]}>
          <Text style={[styles.statusText, badgeTextStyle(item.status)]}>
            {statusLabel(t, item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardAmount}>{formatVND(item.totalAmount)}</Text>
        <Text style={styles.cardMeta}>
          {item.itemCount} {t('order.itemCount')} ·{' '}
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  )

  /** Empty state */
  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>{t('order.noOrders')}</Text>
      </View>
    )
  }

  if (isError && orders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>
          {error?.message ?? t('order.failedToLoad')}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Status pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {STATUS_PILLS.map((s) => {
          const active = s === statusFilter
          return (
            <TouchableOpacity
              key={s === '' ? 'all' : s}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => handleFilterChange(s)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {s === '' ? t('common.noData') : statusLabel(t, s)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {isLoading && orders.length === 0 ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loading} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            orders.length === 0 ? styles.listEmptyContainer : undefined
          }
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
              <ActivityIndicator color="#7c3aed" style={styles.footer} />
            ) : null
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Helpers ──

function statusLabel(
  t: (key: string) => string,
  status: OrderStatus,
): string {
  switch (status) {
    case 'DRAFT':
      return t('order.statusDraft')
    case 'CONFIRMED':
      return t('order.statusConfirmed')
    case 'CANCELLED':
      return t('order.statusCancelled')
  }
}

function badgeStyle(status: OrderStatus) {
  switch (status) {
    case 'DRAFT':
      return { backgroundColor: '#fef3c7' }
    case 'CONFIRMED':
      return { backgroundColor: '#dcfce7' }
    case 'CANCELLED':
      return { backgroundColor: '#fee2e2' }
  }
}

function badgeTextStyle(status: OrderStatus) {
  switch (status) {
    case 'DRAFT':
      return { color: '#b45309' }
    case 'CONFIRMED':
      return { color: '#15803d' }
    case 'CANCELLED':
      return { color: '#b91c1c' }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  pillsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pillActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  pillText: { fontSize: 13, fontWeight: '500', color: '#555' },
  pillTextActive: { color: '#fff' },

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
  cardRef: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' },

  cardFooter: { marginTop: 8 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  loading: { marginTop: 60 },
  footer: { padding: 16 },
  listEmptyContainer: { flex: 1 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#555' },

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
  retryText: { color: '#fff', fontWeight: '600' },

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
