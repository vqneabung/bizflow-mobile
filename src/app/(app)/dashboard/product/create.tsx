/**
 * dashboard/product/create.tsx — Create product form.
 *
 * POST /api/products → back to product list.
 */
import { useState } from 'react'
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
import { router } from 'expo-router'
import * as productService from '@/services/products'

export default function CreateProduct() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [primaryUnit, setPrimaryUnit] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [barcode, setBarcode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = (): string | null => {
    if (!name.trim()) return 'Product name is required'
    if (!primaryUnit.trim()) return 'Primary unit is required'
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      return 'Valid price is required'
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) {
      Alert.alert('Validation Error', err)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || undefined,
        primaryUnit: primaryUnit.trim(),
        price: Number(price),
        costPrice: costPrice.trim() ? Number(costPrice) : undefined,
        stock: stock.trim() ? Number(stock) : undefined,
        minStock: minStock.trim() ? Number(minStock) : undefined,
        barcode: barcode.trim() || undefined,
      }
      const res = await productService.createProduct(payload)
      if (res.success) {
        router.back()
      } else {
        Alert.alert('Error', res.message || 'Failed to create product')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Field label="Product name *">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cement PCB40"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Category">
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Construction"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Primary unit *">
          <TextInput
            style={styles.input}
            value={primaryUnit}
            onChangeText={setPrimaryUnit}
            placeholder="e.g. Bag, Kg, Box"
            placeholderTextColor="#999"
          />
        </Field>

        <Field label="Price (VND) *">
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="85000"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Cost price (VND)">
          <TextInput
            style={styles.input}
            value={costPrice}
            onChangeText={setCostPrice}
            placeholder="70000"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Stock">
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </Field>

        <Field label="Min stock">
          <TextInput
            style={styles.input}
            value={minStock}
            onChangeText={setMinStock}
            placeholder="0"
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
            <Text style={styles.submitText}>Save Product</Text>
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
