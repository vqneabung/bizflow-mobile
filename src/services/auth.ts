/**
 * auth.ts — Auth service (login, register, logout, token management).
 *
 * Flow: form native → POST /api/auth/login → JWT → lưu SecureStore
 * Không dùng OIDC redirect — native form + API (Cách B).
 * Sử dụng oauthClient (không cần Bearer token) + Zustand auth store.
 */
import * as SecureStore from 'expo-secure-store'
import { apiClient } from './api-client'
import { oauthClient } from './oauth-client'
import { useAuthStore } from '@/stores'
import type { User, AuthResponse } from '@/types/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Login — gửi email + password → Spring Boot → lưu JWT vào SecureStore
 * sau đó cập nhật Zustand store.
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const res = await oauthClient.post<AuthResponse>('/auth/login', { email, password })
  const data = res.data.data

  if (!data || !data.token) {
    throw new Error(res.data.message || 'Login failed')
  }

  // Lưu token + user info vào SecureStore
  await SecureStore.setItemAsync(TOKEN_KEY, data.token)
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify({
    email: data.email,
    role: data.role,
    name: data.name,
  }))

  const user: User = { email: data.email, role: data.role, name: data.name }

  // Update Zustand store
  useAuthStore.getState().setSession(user)

  return user
}

/**
 * Register — tạo tài khoản → auto login.
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<User> {
  const res = await oauthClient.post<AuthResponse>('/auth/register', { email, password, name })
  const data = res.data.data

  if (!data || !data.token) {
    throw new Error(res.data.message || 'Registration failed')
  }

  await SecureStore.setItemAsync(TOKEN_KEY, data.token)
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify({
    email: data.email,
    role: data.role,
    name: data.name,
  }))

  const user: User = { email: data.email, role: data.role, name: data.name }

  // Update Zustand store
  useAuthStore.getState().setSession(user)

  return user
}

/**
 * Logout — gọi BFF xoá session server-side, sau đó clear local state.
 *
 * Flow:
 * 1. Gọi BFF /auth/logout (cần Bearer token) → xoá session trong session-store
 * 2. Xoá SecureStore + clear Zustand store
 *
 * Nếu BFF không reachable hoặc token expired → vẫn clear local state (finally).
 */
export async function logoutUser(): Promise<void> {
  try {
    // Gọi BFF xoá session server-side (apiClient tự gắn Bearer token)
    await apiClient.post('/auth/logout')
  } catch {
    // Token đã hết hạn hoặc BFF không reachable → bỏ qua, vẫn clear local
  } finally {
    // Luôn clear local state dù BFF có OK hay không
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
    useAuthStore.getState().clearSession()
  }
}

/**
 * Kiểm tra đã có token chưa (dùng khi app start).
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

/**
 * Lấy thông tin user từ SecureStore.
 * Dùng khi app start — trước khi Zustand store được hydrate.
 */
export async function getStoredUser(): Promise<User | null> {
  try {
    const json = await SecureStore.getItemAsync(USER_KEY)
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}
