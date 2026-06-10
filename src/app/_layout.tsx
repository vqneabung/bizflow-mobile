/**
 * Root layout — Kiểm tra auth + render appropriate screen.
 *
 * Sử dụng Zustand store thay vì React Context.
 *
 * Nếu đang loading: show splash/loading
 * Nếu chưa login: show LoginScreen (index.tsx)
 * Nếu đã login: show TabLayout ((app)/_layout.tsx)
 *
 * Flow 401:
 *   api-client.ts interceptor → useAuthStore.getState().clearSession()
 *   → isAuthenticated = false → useEffect fires → router.replace('/')
 */
import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { getToken, getStoredUser } from '@/services/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s before refetch
      retry: 2,
    },
  },
})

/**
 * Component kiểm tra auth bên trong provider.
 *
 * Không cần AuthProvider wrapper — Zustand store là global singleton,
 * dùng được ngay không cần Context.
 */
function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)

  const router = useRouter()
  const segments = useSegments()

  // Kiểm tra token từ SecureStore khi app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken()
        if (token) {
          const storedUser = await getStoredUser()
          if (storedUser) {
            setSession(storedUser)
          } else {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auth guard: redirect nếu phiên hết hạn
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
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  )
}
