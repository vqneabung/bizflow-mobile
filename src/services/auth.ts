/**
 * auth.ts — Auth service (login, register, logout, token management).
 *
 * Flow: form native → POST /api/auth/login → JWT → lưu SecureStore
 * Không dùng OIDC redirect (Cách B) — native form + API.
 */
import * as SecureStore from 'expo-secure-store'
import { api } from './api'

export interface User {
  id?: string
  email: string
  role: string
  name?: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    token: string
    email: string
    role: string
    name?: string | null
  }
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Login — gửi email + password → Spring Boot → lưu JWT vào SecureStore.
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
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

  return { email: data.email, role: data.role, name: data.name }
}

/**
 * Register — tạo tài khoản → auto login.
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/register', { email, password, name })
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

  return { email: data.email, role: data.role, name: data.name }
}

/**
 * Logout — xóa token khỏi SecureStore.
 */
export async function logoutUser(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(USER_KEY)
}

/**
 * Kiểm tra đã có token chưa (dùng khi app start).
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

/**
 * Lấy thông tin user từ SecureStore.
 */
export async function getStoredUser(): Promise<User | null> {
  try {
    const json = await SecureStore.getItemAsync(USER_KEY)
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}
