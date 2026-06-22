/**
 * dashboard/order/[id]/index.tsx — Order detail screen.
 *
 * Shows order header, items list, total summary, and Cancel action (DRAFT/CONFIRMED).
 */
import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useOrderQuery, useCancelOrderMutation } from '@/hooks/use-orders'
import type { OrderItemResponse, OrderStatus } from '@/types/order'

const formatVND = (n: number): string => `${n.toLocaleString()} đ`

export default function OrderDetail() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: orderRes, isLoading, isError, error, refetch } =
    useOrderQuery(id ?? '')
  const cancelMutation = useCancelOrderMutation()

  const order = orderRes?.data

  const handleCancel = useCallback(() => {
    if (!order) return
    Alert.alert(
      t('order.cancel'),
      t('order.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('order.cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync({ id: order.id })
              Alert.alert(t('common.save'), t('order.cancelSuccess'))
              refetch()
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : ''
              Alert.alert(t('common.error'), message || t('order.cancelFailed'))
            }
          },
        },
      ],
    )
  }, [order, cancelMutation, refetch, t])

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  if (isError || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error?.message ?? t('order.notFound')}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const canCancel = order.status === 'DRAFT' || order.status === 'CONFIRMED'

  return (
    <ScrollView style={styles.container}>
      {/* Header card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.reference} numberOfLines={1}>
            {order.referenceNumber}
          </Text>
          <View style={[styles.statusBadge, badgeStyle(order.status)]}>
            <Text style={[styles.statusText, badgeTextStyle(order.status)]}>
              {statusLabel(t, order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('order.items')}</Text>
        {order.items.length === 0 ? (
          <Text style={styles.empty}>{t('order.itemsRequired')}</Text>
        ) : (
          <FlatList
            data={order.items}
            keyExtractor={(item: OrderItemResponse) => item.id}
            scrollEnabled={false}
            renderItem={({ item: it }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{it.productName}</Text>
                  <Text style={styles.itemMeta}>
                    {it.quantity} × {formatVND(it.unitPrice)}
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
          label={t('order.totalAmount')}
          value={formatVND(order.totalAmount)}
          emphasis
        />
        <SummaryRow
          label={t('order.paidAmount')}
          value={formatVND(order.paidAmount)}
        />
        <SummaryRow
          label={t('order.debtAmount')}
          value={formatVND(order.debtAmount)}
          danger={order.debtAmount > 0}
        />
      </View>

      {/* Notes */}
      {order.notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('order.notes')}</Text>
          <Text style={styles.noteText}>{order.notes}</Text>
        </View>
      )}

      {/* Actions */}
      {canCancel && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <Text style={styles.cancelBtnText}>
                {t('order.cancel')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ── Helpers ──

function SummaryRow({
  label,
  value,
  emphasis = false,
  danger = false,
}: {
  label: string
  value: string
  emphasis?: boolean
  danger?: boolean
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          emphasis && styles.summaryValueEmphasis,
          danger && styles.summaryValueDanger,
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

function statusLabel(t: (key: string) => string, status: OrderStatus): string {
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reference: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, color: '#888', marginTop: 6 },

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
  summaryValueDanger: { color: '#dc2626' },

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
  },
  retryText: { color: '#fff', fontWeight: '600' },

  actions: { padding: 12 },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  cancelBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
})
