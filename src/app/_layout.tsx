/**
 * Root layout — Kiểm tra auth + render appropriate screen.
 *
 * Nếu đang loading: show splash/loading
 * Nếu chưa login: show LoginScreen (index.tsx)
 * Nếu đã login: show TabLayout ((app)/_layout.tsx)
 */
import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

/** Component kiểm tra auth bên trong provider */
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return

    const inAppGroup = segments[0] === '(app)'

    if (!isAuthenticated && inAppGroup) {
      // Chưa login mà vào (app) → redirect về login
      router.replace('/')
    } else if (isAuthenticated && !inAppGroup) {
      // Đã login mà ở login screen → redirect vào dashboard
      router.replace('/(app)/dashboard')
    }
  }, [isAuthenticated, isLoading, segments])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(app)" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  )
}
