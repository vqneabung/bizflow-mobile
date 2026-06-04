/**
 * dashboard/index.tsx — Product list (main screen of Dashboard tab).
 *
 * FlatList cards + search bar + FAB "Create" + pull-to-refresh.
 */
import { useCallback, useEffect, useState } from 'react'
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
import { useAuth } from '@/contexts/AuthContext'
import * as productService from '@/services/products'
import type { ProductResponse } from '@/types/product'

export default function ProductList() {
  const { user } = useAuth()

  const [products, setProducts] = useState<ProductResponse[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      try {
        setError(null)
        const res = await productService.listProducts({
          search: search || undefined,
          category: category || undefined,
          page: pageNum,
          size: 20,
          sortBy: 'createdAt',
          sortDir: 'desc',
        })
        if (append) {
          setProducts((prev) => [...prev, ...res.data])
        } else {
          setProducts(res.data)
        }
        setTotalPages(res.pagination.totalPages)
      } catch (e: any) {
        setError(e?.message || 'Failed to load products')
      }
    },
    [search, category],
  )

  // Load on mount + when search/category/page change
  useEffect(() => {
    setLoading(true)
    setProducts([])
    setPage(1)
    fetchProducts(1).finally(() => setLoading(false))
  }, [search, category])

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    await fetchProducts(1)
    setRefreshing(false)
  }, [fetchProducts])

  // Load more (infinite scroll)
  const onEndReached = useCallback(async () => {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    await fetchProducts(nextPage, true)
    setLoadingMore(false)
  }, [page, totalPages, loadingMore, fetchProducts])

  const handleProductPress = (id: string) => {
    router.push(`/dashboard/product/${id}` as Href)
  }

  const handleCreate = () => {
    router.push('/dashboard/product/create' as Href)
  }

  const handleLogout = async () => {
    // handled by profile tab or alert
    Alert.alert('Bizflow', 'Logout from Profile tab')
  }

  /** Render one product card */
  const renderProduct = ({ item }: { item: ProductResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.isLowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardCategory}>
        {item.category ?? '—'} · {item.primaryUnit}
      </Text>

      <View style={styles.cardRow}>
        <Text style={styles.cardPrice}>
          {item.price.toLocaleString()} đ
        </Text>
        <Text style={styles.cardStock}>
          Stock: {item.stock}
          {item.minStock != null ? ` (min: ${item.minStock})` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  )

  /** Empty state */
  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No products</Text>
        <Text style={styles.emptySub}>
          {search || category
            ? 'Try adjusting your search or filter'
            : 'Tap + to create your first product'}
        </Text>
      </View>
    )
  }

  /** Error state */
  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true)
            fetchProducts(1).finally(() => setLoading(false))
          }}
        >
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
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Loading */}
      {loading && products.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#7c3aed"
          style={{ marginTop: 60 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={products.length === 0 ? { flex: 1 } : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color="#7c3aed"
                style={{ padding: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* FAB — Create Product */}
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

  // Product card
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
  lowStockBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  lowStockText: { fontSize: 11, color: '#dc2626', fontWeight: '600' },
  cardCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  cardStock: { fontSize: 12, color: '#555' },

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
