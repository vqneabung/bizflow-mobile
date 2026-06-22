/**
 * dashboard/stock-import/create.tsx — Create stock import screen.
 *
 * Form: referenceNumber + supplier + notes + importDate + line items.
 * Loads products via useQuery (size 100) for the picker Modal.
 */
import { useMemo, useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'
import { useCreateStockImportMutation } from '@/hooks/use-stock-imports'
import { listProducts } from '@/services/products'
import type { CreateStockImportItemRequest } from '@/types/stock-import'
import type { ProductResponse } from '@/types/product'

interface DraftItem extends CreateStockImportItemRequest {
  productName?: string
}

const formatToday = (): string => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CreateStockImport() {
  const { t } = useTranslation()
  const [referenceNumber, setReferenceNumber] = useState('')
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')
  const [importDate, setImportDate] = useState(formatToday())
  const [items, setItems] = useState<DraftItem[]>([])
  const [productPickerFor, setProductPickerFor] = useState<number | null>(null)

  // Load products (size 100 is enough for picker)
  const productsQuery = useQuery({
    queryKey: ['stock-import-create', 'products'] as const,
    queryFn: () => listProducts({ page: 1, size: 100 }),
  })

  const products: ProductResponse[] = productsQuery.data?.data ?? []
  const mutation = useCreateStockImportMutation()

  const grandTotal = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0),
    [items],
  )

  /** Add a blank item row. */
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', quantity: 1, unitCost: 0 },
    ])
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

  /** Pick product for an item. */
  const pickProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    updateItem(index, {
      productId: product.id,
      productName: product.name,
    })
    setProductPickerFor(null)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert(t('common.error'), t('stockImport.itemsRequired'))
      return
    }
    const invalidItem = items.find(
      (it) => !it.productId || it.quantity <= 0 || it.unitCost < 0,
    )
    if (invalidItem) {
      Alert.alert(t('common.error'), t('stockImport.itemsRequired'))
      return
    }

    try {
      const payload: {
        referenceNumber?: string
        supplier?: string
        notes?: string
        importDate?: string
        items: CreateStockImportItemRequest[]
      } = {
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitCost: it.unitCost,
        })),
      }
      const ref = referenceNumber.trim()
      if (ref) payload.referenceNumber = ref
      const sup = supplier.trim()
      if (sup) payload.supplier = sup
      const n = notes.trim()
      if (n) payload.notes = n
      if (importDate) payload.importDate = importDate

      const result = await mutation.mutateAsync(payload)
      if (result.success) {
        Alert.alert(t('common.save'), t('stockImport.createSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ])
      } else {
        Alert.alert(
          t('common.error'),
          result.message ?? t('stockImport.createFailed'),
        )
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ''
      Alert.alert(t('common.error'), message || t('stockImport.createFailed'))
    }
  }

  if (productsQuery.isLoading) {
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
        {/* Reference number */}
        <Text style={styles.label}>{t('stockImport.referenceNumber')}</Text>
        <TextInput
          style={styles.input}
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder={t('stockImport.referenceNumberPlaceholder')}
          placeholderTextColor="#999"
        />

        {/* Supplier */}
        <Text style={styles.label}>{t('stockImport.supplier')}</Text>
        <TextInput
          style={styles.input}
          value={supplier}
          onChangeText={setSupplier}
          placeholder={t('stockImport.supplierPlaceholder')}
          placeholderTextColor="#999"
        />

        {/* Import date */}
        <Text style={styles.label}>{t('stockImport.importDate')}</Text>
        <TextInput
          style={styles.input}
          value={importDate}
          onChangeText={setImportDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />

        {/* Items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.label}>{t('stockImport.items')}</Text>
          <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
            <Text style={styles.addItemBtnText}>
              + {t('stockImport.addProduct')}
            </Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 && (
          <Text style={styles.emptyItems}>{t('stockImport.itemsRequired')}</Text>
        )}

        {items.map((it, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>{t('stockImport.product')}</Text>
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
                  {it.productName ?? t('stockImport.selectProduct')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('stockImport.quantity')}</Text>
                <TextInput
                  style={styles.itemInput}
                  value={String(it.quantity)}
                  onChangeText={(v) => {
                    const n = Number(v.replace(/[^0-9]/g, '')) || 0
                    updateItem(index, { quantity: n })
                  }}
                  keyboardType="numeric"
                  placeholder={t('stockImport.quantityPlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('stockImport.unitCost')}</Text>
                <TextInput
                  style={styles.itemInput}
                  value={String(it.unitCost)}
                  onChangeText={(v) => {
                    const n = Number(v.replace(/[^0-9.]/g, '')) || 0
                    updateItem(index, { unitCost: n })
                  }}
                  keyboardType="numeric"
                  placeholder={t('stockImport.unitCostPlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.itemFooter}>
              <Text style={styles.itemSubtotal}>
                {t('stockImport.subtotal')}:{' '}
                {(it.quantity * it.unitCost).toLocaleString()} đ
              </Text>
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Text style={styles.removeItemBtn}>
                  🗑 {t('stockImport.removeItem')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Grand total */}
        {items.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('stockImport.grandTotal')}</Text>
            <Text style={styles.totalValue}>{grandTotal.toLocaleString()} đ</Text>
          </View>
        )}

        {/* Notes */}
        <Text style={styles.label}>{t('stockImport.notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('stockImport.notesPlaceholder')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            mutation.isPending && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('stockImport.save')}</Text>
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
            <Text style={styles.modalTitle}>{t('stockImport.selectProduct')}</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    productPickerFor !== null &&
                    pickProduct(productPickerFor, p.id)
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
                <Text style={styles.modalEmpty}>{t('stockImport.noProducts')}</Text>
              }
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
