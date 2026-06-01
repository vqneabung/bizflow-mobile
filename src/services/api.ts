/**
 * api.ts — Axios HTTP client instance.
 *
 * Dùng axios thay vì Ky vì:
 * - RN không có Web Fetch API chuẩn (Ky không compatible)
 * - Axios dùng XMLHttpRequest, RN support tốt
 * - Interceptor để tự động gắn Bearer token
 */
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { ENV } from '@/config/env'

export const api = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api`,
  timeout: ENV.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/** Interceptor: tự động gắn JWT Bearer token vào mọi request */
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // SecureStore không available → tiếp tục request không token
  }
  return config
})

/** Interceptor: xử lý lỗi 401 → xóa token */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token')
    }
    return Promise.reject(error)
  },
)
