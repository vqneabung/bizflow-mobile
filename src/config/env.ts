/**
 * env.ts — Environment configuration.
 *
 * Tách riêng config để dễ thay đổi giữa dev/production.
 * Thay vì react-native-config (cần native module), dùng constants.
 * Khi deploy: chỉ cần sửa file này.
 */
import { Platform } from 'react-native'

// Android emulator dùng 10.0.2.2 để access localhost
// iOS simulator dùng localhost
const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080'
  return 'http://localhost:8080'
}

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? getBaseUrl(),
  API_TIMEOUT: 10000,
  APP_NAME: 'Bizflow',
} as const
