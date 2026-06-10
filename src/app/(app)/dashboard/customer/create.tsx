/**
 * dashboard/customer/create.tsx — Create customer screen.
 *
 * Form với TextInput fields + Submit button.
 * Dùng useCreateCustomerMutation từ react-query.
 */
import { useState } from 'react'
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
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useCreateCustomerMutation } from '@/hooks/use-customers'

export default function CreateCustomer() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  const mutation = useCreateCustomerMutation()

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('customer.nameRequired'), t('customer.nameRequired'))
      return
    }

    try {
      const result = await mutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
      })
      if (result.success) {
        router.back()
      } else {
        Alert.alert(t('common.error'), result.message || t('customer.failedToCreate'))
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message || t('customer.failedToCreate'))
    }
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

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('customer.createCustomer')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
