/**
 * dashboard/stock-import/index.tsx — Stock import list screen.
 *
 * FlatList cards + pull-to-refresh + load more.
 * FAB "Create" routes to /dashboard/stock-import/create.
 */
import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useStockImportsQuery } from '@/hooks/use-stock-imports'
import type { StockImportSummaryResponse } from '@/types/stock-import'

const formatVND = (n: number): string => `${n.toLocaleString()} đ`

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('vi-VN')
  } catch {
    return iso
  }
}

export default function StockImportList() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch, isFetching } =
    useStockImportsQuery({ page, size: 20 })

  const imports = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  const handleImportPress = (id: string) => {
    router.push(`/dashboard/stock-import/${id}` as Href)
  }

  const handleCreate = () => {
    router.push('/dashboard/stock-import/create' as Href)
  }

  const handleLoadMore = () => {
    if (isFetching || page >= totalPages) return
    setPage((p) => p + 1)
  }

  /** Render one stock-import card */
  const renderImport = ({ item }: { item: StockImportSummaryResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleImportPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardRef} numberOfLines={1}>
          {item.referenceNumber}
        </Text>
        <Text style={styles.cardDate}>{formatDate(item.importDate)}</Text>
      </View>

      {item.supplier && (
        <Text style={styles.cardSupplier} numberOfLines={1}>
          🏭 {item.supplier}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.cardAmount}>{formatVND(item.totalCost)}</Text>
        <Text style={styles.cardMeta}>
          {item.itemCount} {t('stockImport.itemCount')}
        </Text>
      </View>
    </TouchableOpacity>
  )

  /** Empty state */
  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>{t('stockImport.noStockImports')}</Text>
      </View>
    )
  }

  if (isError && imports.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>
          {error?.message ?? t('stockImport.failedToLoad')}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {isLoading && imports.length === 0 ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loading} />
      ) : (
        <FlatList
          data={imports}
          keyExtractor={(item) => item.id}
          renderItem={renderImport}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            imports.length === 0 ? styles.listEmptyContainer : undefined
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

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
  cardDate: { fontSize: 12, color: '#888', marginLeft: 8 },
  cardSupplier: { fontSize: 13, color: '#555', marginTop: 6 },

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
