/**
 * dashboard/stock-import/[id]/index.tsx — Stock import detail screen.
 *
 * Shows import header (reference, supplier, date, notes), items list,
 * and total. No actions (backend has no update/delete endpoints).
 */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useStockImportQuery } from '@/hooks/use-stock-imports'
import type { StockImportItemResponse } from '@/types/stock-import'

const formatVND = (n: number): string => `${n.toLocaleString()} đ`

const formatDateTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}

export default function StockImportDetail() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  const {
    data: importRes,
    isLoading,
    isError,
    error,
    refetch,
  } = useStockImportQuery(id ?? '')

  const stockImport = importRes?.data

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  if (isError || !stockImport) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error?.message ?? t('stockImport.notFound')}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← {t('stockImport.back')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header card */}
      <View style={styles.card}>
        <Text style={styles.reference} numberOfLines={1}>
          {stockImport.referenceNumber}
        </Text>
        <Text style={styles.meta}>
          {t('stockImport.importDate')}:{' '}
          {formatDateTime(stockImport.importDate)}
        </Text>
        {stockImport.supplier && (
          <Text style={styles.meta}>
            🏭 {stockImport.supplier}
          </Text>
        )}
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('stockImport.items')}</Text>
        {stockImport.items.length === 0 ? (
          <Text style={styles.empty}>{t('stockImport.itemsRequired')}</Text>
        ) : (
          <FlatList
            data={stockImport.items}
            keyExtractor={(item: StockImportItemResponse) => item.id}
            scrollEnabled={false}
            renderItem={({ item: it }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{it.productName}</Text>
                  <Text style={styles.itemMeta}>
                    {it.quantity} × {formatVND(it.unitCost)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatVND(it.subtotal)}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Total summary */}
      <View style={styles.card}>
        <SummaryRow
          label={t('stockImport.itemCount')}
          value={String(stockImport.itemCount)}
        />
        <SummaryRow
          label={t('stockImport.totalCost')}
          value={formatVND(stockImport.totalCost)}
          emphasis
        />
      </View>

      {/* Notes */}
      {stockImport.notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('stockImport.notes')}</Text>
          <Text style={styles.noteText}>{stockImport.notes}</Text>
        </View>
      )}

      {/* Created at */}
      <View style={styles.card}>
        <SummaryRow
          label={t('stockImport.createdAt')}
          value={formatDateTime(stockImport.createdAt)}
        />
        {stockImport.updatedAt && (
          <SummaryRow
            label={t('stockImport.updatedAt')}
            value={formatDateTime(stockImport.updatedAt)}
          />
        )}
      </View>

      {/* Back button */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← {t('stockImport.back')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ── Helpers ──

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          emphasis && styles.summaryValueEmphasis,
        ]}
      >
        {value}
      </Text>
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

  reference: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  meta: { fontSize: 13, color: '#555', marginTop: 6 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  itemName: { fontSize: 14, color: '#333', fontWeight: '500' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemSubtotal: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: '#555' },
  summaryValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  summaryValueEmphasis: { fontSize: 18, fontWeight: '700', color: '#7c3aed' },

  noteText: { fontSize: 14, color: '#555', lineHeight: 20 },
  empty: { fontSize: 14, color: '#888', fontStyle: 'italic' },

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
    marginBottom: 12,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  actions: { padding: 12 },
  backBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backBtnText: { color: '#7c3aed', fontSize: 15, fontWeight: '600' },
})
