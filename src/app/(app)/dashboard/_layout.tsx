/**
 * dashboard/_layout.tsx — Stack layout cho Dashboard tab.
 *
 * Cho phép push màn hình con (product detail, create, edit, customer...)
 * trong cùng tab Dashboard với header + back button.
 */
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function DashboardLayout() {
  const { t } = useTranslation()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('dashboard.products') }} />
      <Stack.Screen
        name="product/create"
        options={{ title: t('product.create.title') }}
      />
      <Stack.Screen
        name="customer/index"
        options={{ title: t('customer.title') }}
      />
      <Stack.Screen
        name="customer/create"
        options={{ title: t('customer.createTitle') }}
      />
      <Stack.Screen
        name="customer/[id]"
        options={{ title: t('customer.detailTitle') }}
      />
      <Stack.Screen
        name="customer/[id]/edit"
        options={{ title: t('customer.editTitle') }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ title: t('product.detail.title') }}
      />
      <Stack.Screen
        name="product/[id]/edit"
        options={{ title: t('product.edit.title') }}
      />
    </Stack>
  )
}
