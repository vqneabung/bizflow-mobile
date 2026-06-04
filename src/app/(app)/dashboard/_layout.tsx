/**
 * dashboard/_layout.tsx — Stack layout cho Dashboard tab.
 *
 * Cho phép push màn hình con (product detail, create, edit)
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
    </Stack>
  )
}
