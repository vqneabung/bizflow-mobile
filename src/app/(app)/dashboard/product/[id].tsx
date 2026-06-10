/**
 * dashboard/product/[id].tsx — Product detail screen.
 *
 * Hiển thị thông tin đầy đủ sản phẩm, cho phép edit/deactivate.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams, router, type Href } from 'expo-router'
import * as productService from '@/services/products'
import type { ProductResponse } from '@/types/product'
import { useTranslation } from 'react-i18next'

export default function ProductDetail() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await productService.getProduct(id)
      if (res.success && res.data) {
        setProduct(res.data)
      } else {
        setError(res.message || t('product.detail.notFound'))
      }
    } catch (e: any) {
      setError(e?.message || t('product.detail.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    load()
  }, [load])

  const handleEdit = () => {
    router.push(`/dashboard/product/${id}/edit` as Href)
  }

  const handleDeactivate = () => {
    Alert.alert(
      t('product.detail.deactivateTitle'),
      t('product.detail.deactivateConfirm', { name: product?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.deactivate'),
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deactivateProduct(id!)
              load()
            } catch (e: any) {
              Alert.alert('Error', e?.message || t('product.detail.failedToDeactivate'))
            }
          },
        },
      ],
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!product) return null

  return (
    <ScrollView style={styles.container}>
      {/* Header: name + status */}
      <View style={styles.card}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{product.name}</Text>
          {!product.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>{t('product.detail.inactive')}</Text>
            </View>
          )}
          {product.isLowStock && (
            <View style={styles.lowBadge}>
              <Text style={styles.lowText}>{t('product.detail.lowStock')}</Text>
            </View>
          )}
        </View>

        <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
      </View>

      {/* Info grid */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('product.detail.productInfo')}</Text>
        <View style={styles.infoGrid}>
          <InfoRow label={t('product.detail.category')} value={product.categoryName ?? '—'} />
          <InfoRow label={t('product.detail.primaryUnit')} value={product.primaryUnitName ?? '—'} />
          <InfoRow label={t('product.detail.barcode')} value={product.barcode ?? '—'} />
          <InfoRow label={t('product.detail.costPrice')} value={product.costPrice != null ? `${product.costPrice.toLocaleString()} đ` : '—'} />
          <InfoRow label={t('product.detail.stock')} value={String(product.stock)} />
          <InfoRow label={t('product.detail.minStock')} value={product.minStock != null ? String(product.minStock) : '—'} />
        </View>
      </View>

      {/* Timestamps */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('product.detail.timeline')}</Text>
        <InfoRow label={t('product.detail.created')} value={new Date(product.createdAt).toLocaleString('vi-VN')} />
        {product.updatedAt && (
          <InfoRow label={t('product.detail.updated')} value={new Date(product.updatedAt).toLocaleString('vi-VN')} />
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
          <Text style={styles.editBtnText}>✏  {t('product.detail.editProduct')}</Text>
        </TouchableOpacity>

        {product.isActive && (
          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={handleDeactivate}
          >
            <Text style={styles.deactivateBtnText}>🗑  {t('product.detail.deactivateProduct')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Header
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  price: { fontSize: 26, fontWeight: '700', color: '#7c3aed', marginTop: 8 },

  // Badges
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inactiveText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  lowBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lowText: { fontSize: 11, color: '#dc2626', fontWeight: '600' },

  // Info grid
  infoGrid: { gap: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  // Error
  errorText: { fontSize: 14, color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  // Actions
  actions: { padding: 12, gap: 10 },
  editBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deactivateBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deactivateBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
})
