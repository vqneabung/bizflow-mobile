/**
 * dashboard/customer/[id]/edit.tsx — Edit customer screen.
 *
 * Pre-populates form with existing customer data, saves via react-query.
 */
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useCustomerQuery, useUpdateCustomerMutation } from '@/hooks/use-customers'

export default function EditCustomer() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  const { data: customerRes, isLoading } = useCustomerQuery(id!)
  const mutation = useUpdateCustomerMutation()

  // Pre-populate form
  useEffect(() => {
    const c = customerRes?.data
    if (c) {
      setName(c.name)
      setPhone(c.phone ?? '')
      setEmail(c.email ?? '')
      setAddress(c.address ?? '')
      setNote(c.note ?? '')
    }
  }, [customerRes])

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('customer.nameRequired'), t('customer.nameRequired'))
      return
    }

    try {
      const result = await mutation.mutateAsync({
        id: id!,
        data: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          note: note.trim() || undefined,
        },
      })
      if (result.success) {
        router.back()
      } else {
        Alert.alert(t('common.error'), result.message || t('customer.failedToUpdate'))
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message || t('customer.failedToUpdate'))
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>{t('customer.name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('customer.namePlaceholder')}
          placeholderTextColor="#999"
          autoCapitalize="words"
        />

        <Text style={styles.label}>{t('customer.phone')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('customer.phonePlaceholder')}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{t('customer.email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t('customer.emailPlaceholder')}
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t('customer.address')}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={t('customer.addressPlaceholder')}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>{t('customer.note')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={note}
          onChangeText={setNote}
          placeholder={t('customer.notePlaceholder')}
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
            <Text style={styles.submitText}>{t('customer.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: { padding: 16, gap: 12 },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: -4,
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
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },

  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
