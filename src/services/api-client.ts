/**
 * api-client.ts — Axios instance for all authenticated API calls.
 *
 * Interceptors:
 * 1. Request — tự động gắn Bearer token từ SecureStore
 * 2. Response — 401 → xóa token + clear Zustand store
 *
 * Separation of concerns:
 * - oauth-client.ts: for login/register (no token needed)
 * - api-client.ts:  for everything else (token + 401 handling)
 */
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { ENV } from '@/config/env'
import { useAuthStore } from '@/stores'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const apiClient = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api`,
  timeout: ENV.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/** Interceptor: tự động gắn JWT Bearer token vào mọi request */
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // SecureStore không available → tiếp tục request không token
  }
  return config
})

/**
 * Interceptor: xóa token + clear auth store khi 401.
 *
 * Khác biệt quan trọng so với api.ts cũ:
 * - Xóa CẢ auth_token VÀ auth_user (không để stale data)
 * - Gọi useAuthStore.getState().clearSession() để cập nhật state
 *   → AuthGuard useEffect chạy → router.replace('/')
 * - Không import React — Zustand store là vanilla JS
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear both token and user from SecureStore
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      await SecureStore.deleteItemAsync(USER_KEY)
      // Clear Zustand store → triggers AuthGuard redirect
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  },
)
