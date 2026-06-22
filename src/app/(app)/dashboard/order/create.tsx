/**
 * dashboard/order/create.tsx — Create order screen.
 *
 * Form: status toggle + customer dropdown + line items + notes + submit.
 * Loads products and customers via useQuery on mount.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useCreateOrderMutation } from '@/hooks/use-orders'
import { useCustomersQuery } from '@/hooks/use-customers'
import { listProducts } from '@/services/products'
import { useQuery } from '@tanstack/react-query'
import type { OrderStatus, CreateOrderItemRequest } from '@/types/order'
import type { ProductResponse } from '@/types/product'
import type { CustomerResponse } from '@/types/customer'

interface DraftItem extends CreateOrderItemRequest {
  productName?: string
}

interface CustomerOption {
  id: string
  name: string
  phone?: string | null
}

export default function CreateOrder() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<OrderStatus>('DRAFT')
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftItem[]>([])
  const [productPickerFor, setProductPickerFor] = useState<number | null>(null)
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false)

  // Load products (size 100 is enough for picker)
  const productsQuery = useQuery({
    queryKey: ['order-create', 'products'] as const,
    queryFn: () => listProducts({ page: 1, size: 100 }),
  })
  // Load customers (size 100 for picker)
  const customersQuery = useCustomersQuery({ page: 1, size: 100 })

  const products: ProductResponse[] = productsQuery.data?.data ?? []
  const customers: CustomerResponse[] = customersQuery.data?.data ?? []
  const customerOptions: CustomerOption[] = useMemo(
    () => [
      { id: '', name: t('order.walkIn'), phone: null },
      ...customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
      })),
    ],
    [customers, t],
  )

  const mutation = useCreateOrderMutation()

  const grandTotal = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0),
    [items],
  )

  const isLoadingOptions = productsQuery.isLoading || customersQuery.isLoading

  /** Add a blank item row. */
  const addItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  /** Remove item at index. */
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  /** Update one field of an item. */
  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    )
  }

  /** Pick product for an item; auto-fill unitPrice. */
  const pickProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    updateItem(index, {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
    })
    setProductPickerFor(null)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert(t('common.error'), t('order.itemsRequired'))
      return
    }
    const invalidItem = items.find(
      (it) => !it.productId || it.quantity <= 0 || it.unitPrice < 0,
    )
    if (invalidItem) {
      Alert.alert(t('common.error'), t('order.itemsRequired'))
      return
    }

    try {
      const result = await mutation.mutateAsync({
        status,
        customerId: customerId || undefined,
        notes: notes.trim() || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      })
      if (result.success) {
        Alert.alert(t('common.save'), t('order.createSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ])
      } else {
        Alert.alert(t('common.error'), result.message ?? t('order.createFailed'))
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ''
      Alert.alert(t('common.error'), message || t('order.createFailed'))
    }
  }

  if (isLoadingOptions) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        {/* Status toggle */}
        <Text style={styles.label}>{t('order.status')}</Text>
        <View style={styles.statusRow}>
          <Pressable
            style={[styles.statusBtn, status === 'DRAFT' && styles.statusBtnActive]}
            onPress={() => setStatus('DRAFT')}
          >
            <Text
              style={[
                styles.statusBtnText,
                status === 'DRAFT' && styles.statusBtnTextActive,
              ]}
            >
              {t('order.statusDraft')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.statusBtn,
              status === 'CONFIRMED' && styles.statusBtnActive,
            ]}
            onPress={() => setStatus('CONFIRMED')}
          >
            <Text
              style={[
                styles.statusBtnText,
                status === 'CONFIRMED' && styles.statusBtnTextActive,
              ]}
            >
              {t('order.statusConfirmed')}
            </Text>
          </Pressable>
        </View>

        {/* Customer picker */}
        <Text style={styles.label}>{t('order.customer')}</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setCustomerPickerOpen(true)}
        >
          <Text
            style={
              customerId
                ? styles.pickerTriggerValue
                : styles.pickerTriggerPlaceholder
            }
          >
            {(() => {
              if (!customerId) return t('order.selectCustomer')
              const c = customerOptions.find((x) => x.id === customerId)
              return c ? `${c.name}${c.phone ? ` (${c.phone})` : ''}` : t('order.walkIn')
            })()}
          </Text>
        </TouchableOpacity>

        {/* Items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.label}>{t('order.items')}</Text>
          <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
            <Text style={styles.addItemBtnText}>+ {t('order.addItem')}</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 && (
          <Text style={styles.emptyItems}>{t('order.itemsRequired')}</Text>
        )}

        {items.map((it, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>{t('order.product')}</Text>
              <TouchableOpacity
                style={styles.itemPicker}
                onPress={() => setProductPickerFor(index)}
              >
                <Text
                  style={
                    it.productId
                      ? styles.itemPickerValue
                      : styles.itemPickerPlaceholder
                  }
                  numberOfLines={1}
                >
                  {it.productName ?? t('order.selectProduct')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('order.quantity')}</Text>
                <TextInput
                  style={styles.itemInput}
                  value={String(it.quantity)}
                  onChangeText={(v) => {
                    const n = Number(v.replace(/[^0-9]/g, '')) || 0
                    updateItem(index, { quantity: n })
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('order.unitPrice')}</Text>
                <TextInput
                  style={styles.itemInput}
                  value={String(it.unitPrice)}
                  onChangeText={(v) => {
                    const n = Number(v.replace(/[^0-9.]/g, '')) || 0
                    updateItem(index, { unitPrice: n })
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.itemFooter}>
              <Text style={styles.itemSubtotal}>
                {t('order.subtotal')}:{' '}
                {(it.quantity * it.unitPrice).toLocaleString()} đ
              </Text>
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Text style={styles.removeItemBtn}>
                  🗑 {t('order.removeItem')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Grand total */}
        {items.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('order.totalAmount')}</Text>
            <Text style={styles.totalValue}>{grandTotal.toLocaleString()} đ</Text>
          </View>
        )}

        {/* Notes */}
        <Text style={styles.label}>{t('order.notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('order.notesPlaceholder')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product picker modal */}
      <Modal
        visible={productPickerFor !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setProductPickerFor(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProductPickerFor(null)}
        >
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{t('order.selectProduct')}</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    productPickerFor !== null && pickProduct(productPickerFor, p.id)
                  }
                >
                  <Text style={styles.modalItemName}>{p.name}</Text>
                  <Text style={styles.modalItemSub}>
                    {p.price.toLocaleString()} đ
                    {p.primaryUnitName ? ` · ${p.primaryUnitName}` : ''}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>{t('common.noData')}</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Customer picker modal */}
      <Modal
        visible={customerPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCustomerPickerOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCustomerPickerOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{t('order.selectCustomer')}</Text>
            <FlatList
              data={customerOptions}
              keyExtractor={(item) => item.id || 'walkin'}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCustomerId(c.id)
                    setCustomerPickerOpen(false)
                  }}
                >
                  <Text style={styles.modalItemName}>{c.name}</Text>
                  {c.phone && (
                    <Text style={styles.modalItemSub}>{c.phone}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  form: { padding: 16, gap: 12 },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: { minHeight: 80, paddingTop: 12 },

  // Status toggle
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  statusBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  statusBtnTextActive: { color: '#fff' },

  // Picker trigger
  pickerTrigger: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickerTriggerValue: { fontSize: 15, color: '#1a1a1a' },
  pickerTriggerPlaceholder: { fontSize: 15, color: '#999' },

  // Items
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addItemBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
  },
  addItemBtnText: { fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  emptyItems: { fontSize: 13, color: '#888', fontStyle: 'italic' },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  itemRow: { flexDirection: 'row', gap: 8 },
  itemLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  itemInput: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemPicker: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemPickerValue: { fontSize: 14, color: '#1a1a1a' },
  itemPickerPlaceholder: { fontSize: 14, color: '#999' },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemSubtotal: { fontSize: 13, color: '#555', fontWeight: '600' },
  removeItemBtn: { fontSize: 12, color: '#dc2626', fontWeight: '500' },

  // Total
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#7c3aed' },

  // Submit
  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  modalItemName: { fontSize: 15, color: '#1a1a1a' },
  modalItemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  modalEmpty: { padding: 24, textAlign: 'center', color: '#888' },
})
