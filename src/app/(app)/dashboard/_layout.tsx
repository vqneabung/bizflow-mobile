/**
 * dashboard/_layout.tsx — Stack layout cho Dashboard tab.
 *
 * Cho phép push màn hình con (product detail, create, edit, customer...)
 * trong cùng tab Dashboard với header + back button.
 */
import { Stack } from 'expo-router'

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen
        name="product/create"
        options={{ title: 'Create Product' }}
      />
      <Stack.Screen
        name="customer/index"
        options={{ title: 'Customers' }}
      />
      <Stack.Screen
        name="customer/create"
        options={{ title: 'Create Customer' }}
      />
      <Stack.Screen
        name="customer/[id]"
        options={{ title: 'Customer Detail' }}
      />
      <Stack.Screen
        name="customer/[id]/edit"
        options={{ title: 'Edit Customer' }}
      />
    </Stack>
  )
}
