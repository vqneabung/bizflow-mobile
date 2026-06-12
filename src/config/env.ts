/**
 * env.ts — Environment configuration.
 *
 * Tách riêng config để dễ thay đổi giữa dev/production.
 * Thay vì react-native-config (cần native module), dùng constants.
 * Khi deploy: chỉ cần sửa file này.
 *
 * Architecture:
 * - Mobile → BFF (localhost:3001) → Spring Boot (localhost:8080)
 * - Mobile KHÔNG gọi trực tiếp Spring Boot
 * - BFF quản lý JWT session (không lộ Spring Boot JWT ra mobile)
 */
import { Platform } from 'react-native'

// Android emulator dùng 10.0.2.2 để access localhost (BFF port 3001)
// iOS simulator dùng localhost (BFF port 3001)
const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001'
  return 'http://localhost:3001'
}

export const ENV = {
  /** Base URL for BFF server (Fastify, port 3001) */
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? getBaseUrl(),
  API_TIMEOUT: 10000,
  APP_NAME: 'Bizflow',
} as const
