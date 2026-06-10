/**
 * dashboard/customer/[id]/index.tsx — Customer detail screen.
 *
 * Hiển thị thông tin đầy đủ khách hàng, cho phép edit/deactivate.
 * Hiển thị lịch sử mua hàng (orders).
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
import { useLocalSearchParams, router, type Href } from 'expo-router'
import { useCustomerQuery, useDeactivateCustomerMutation, useCustomerOrdersQuery } from '@/hooks/use-customers'
import type { OrderSummary } from '@/types/customer'

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [ordersPage, setOrdersPage] = useState(1)

  const { data: customerRes, isLoading, isError, error, refetch } = useCustomerQuery(id!)
  const deactivateMutation = useDeactivateCustomerMutation()
  const { data: ordersRes, isFetching: ordersFetching } = useCustomerOrdersQuery(id!, ordersPage)

  const customer = customerRes?.data
  const orders = ordersRes?.data ?? []
  const totalOrdersPages = ordersRes?.pagination?.totalPages ?? 1

  const handleEdit = () => {
    router.push(`/dashboard/customer/${id}/edit` as Href)
  }

  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate Customer',
      `Are you sure you want to deactivate "${customer?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateMutation.mutateAsync(id!)
              refetch()
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to deactivate')
            }
          },
        },
      ],
    )
  }

  const handleOrdersLoadMore = () => {
    if (ordersFetching || ordersPage >= totalOrdersPages) return
    setOrdersPage((p) => p + 1)
  }

  // Loading
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  // Error
  if (isError || !customer) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {(error as any)?.message || 'Customer not found'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header card */}
      <View style={styles.card}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{customer.name}</Text>
          {!customer.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
        </View>

        <Text style={styles.debtAmount}>
          Debt: {customer.totalDebt.toLocaleString()} đ
        </Text>
      </View>

      {/* Contact info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <InfoRow label="Phone" value={customer.phone ?? '—'} />
        <InfoRow label="Email" value={customer.email ?? '—'} />
        <InfoRow label="Address" value={customer.address ?? '—'} />
      </View>

      {/* Notes */}
      {customer.note && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.noteText}>{customer.note}</Text>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <InfoRow label="Created" value={new Date(customer.createdAt).toLocaleString('vi-VN')} />
        {customer.updatedAt && (
          <InfoRow label="Updated" value={new Date(customer.updatedAt).toLocaleString('vi-VN')} />
        )}
      </View>

      {/* Purchase History */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Purchase History</Text>
        {orders.length === 0 && !ordersFetching ? (
          <Text style={styles.emptyOrders}>No orders yet</Text>
        ) : (
          <>
            {orders.map((order: OrderSummary) => (
              <View key={order.id} style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderRef}>{order.referenceNumber}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.orderTotal}>
                    {order.totalAmount.toLocaleString()} đ
                  </Text>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                </View>
              </View>
            ))}
            {ordersFetching && (
              <ActivityIndicator color="#7c3aed" style={{ padding: 8 }} />
            )}
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
          <Text style={styles.editBtnText}>✏  Edit Customer</Text>
        </TouchableOpacity>

        {customer.isActive && (
          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={handleDeactivate}
          >
            <Text style={styles.deactivateBtnText}>🗑  Deactivate</Text>
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
  debtAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 8,
  },

  // Badges
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inactiveText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },

  // Info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  // Note
  noteText: { fontSize: 14, color: '#555', lineHeight: 20 },

  // Orders
  emptyOrders: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  orderRef: { fontSize: 14, fontWeight: '500', color: '#333' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: '600', color: '#333' },
  orderStatus: { fontSize: 12, color: '#888', marginTop: 2 },

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
