/**
 * dashboard/product/[id]/edit.tsx — Edit product form.
 *
 * GET /api/products/{id} → prefilled form → PUT /api/products/{id} → back.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as productService from '@/services/products'
import type { ProductResponse } from '@/types/product'

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState<ProductResponse | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [primaryUnit, setPrimaryUnit] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [barcode, setBarcode] = useState('')

  const loadProduct = useCallback(async () => {
    if (!id) return
    try {
      const res = await productService.getProduct(id)
      if (res.success && res.data) {
        setProduct(res.data)
        setName(res.data.name)
        setCategory(res.data.category ?? '')
        setPrimaryUnit(res.data.primaryUnit)
        setPrice(String(res.data.price))
        setCostPrice(res.data.costPrice != null ? String(res.data.costPrice) : '')
        setStock(String(res.data.stock))
        setMinStock(res.data.minStock != null ? String(res.data.minStock) : '')
        setBarcode(res.data.barcode ?? '')
      } else {
        Alert.alert('Error', res.message || 'Product not found')
        router.back()
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load product')
      router.back()
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const handleSubmit = async () => {
    if (!id) return

    setSubmitting(true)
    try {
      const payload: Record<string, any> = {}
      if (name !== product?.name) payload.name = name.trim()
      if (category !== (product?.category ?? '')) payload.category = category.trim() || null
      if (primaryUnit !== product?.primaryUnit) payload.primaryUnit = primaryUnit.trim()
      if (Number(price) !== product?.price) payload.price = Number(price)
      if ((costPrice ? Number(costPrice) : null) !== product?.costPrice) {
        payload.costPrice = costPrice.trim() ? Number(costPrice) : null
      }
      if (Number(stock) !== product?.stock) payload.stock = Number(stock)
      if ((minStock ? Number(minStock) : null) !== product?.minStock) {
        payload.minStock = minStock.trim() ? Number(minStock) : null
      }
      if (barcode !== (product?.barcode ?? '')) payload.barcode = barcode.trim() || null

      if (Object.keys(payload).length === 0) {
        router.back()
        return
      }

      const res = await productService.updateProduct(id, payload)
      if (res.success) {
        router.back()
      } else {
        Alert.alert('Error', res.message || 'Failed to update product')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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
        <Field label="Product name">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Product name"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Category">
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Primary unit">
          <TextInput
            style={styles.input}
            value={primaryUnit}
            onChangeText={setPrimaryUnit}
            placeholder="Unit"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Price (VND)">
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Cost price (VND)">
          <TextInput
            style={styles.input}
            value={costPrice}
            onChangeText={setCostPrice}
            placeholder="Cost price"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Stock">
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="Stock"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Min stock">
          <TextInput
            style={styles.input}
            value={minStock}
            onChangeText={setMinStock}
            placeholder="Min stock"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Barcode">
          <TextInput
            style={styles.input}
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Barcode"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </Field>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
