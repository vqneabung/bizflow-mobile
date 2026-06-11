/**
 * storage.ts — MinIO/Storage service.
 *
 * Gọi Spring Boot proxy để lấy presigned download URL.
 * In-memory cache cho single URL trong session.
 * Persistent cache qua image-cache.ts (MMKV).
 */
import { apiClient } from './api-client'

const cache = new Map<string, string>()

export interface DownloadUrlResponse {
  url: string
}

/**
 * Lấy presigned download URL cho 1 objectKey (raw API call).
 * Kết quả được cache trong memory (session-only).
 */
export async function getDownloadUrl(objectKey: string): Promise<string> {
  if (cache.has(objectKey)) {
    return cache.get(objectKey)!
  }
  const res = await apiClient.get<{ data: DownloadUrlResponse }>(
    `/storage/download-url?key=${encodeURIComponent(objectKey)}`,
  )
  const url = res.data.data.url
  cache.set(objectKey, url)
  return url
}

/**
 * Helper: resolve objectKey → presigned URL, throw nếu fail.
 * Dùng cho service layer (image-cache.ts gọi cái này).
 */
export const storageApi = {
  getImageUrl: async (objectKey: string): Promise<string> => {
    const url = await getDownloadUrl(objectKey)
    if (!url) {
      throw new Error(`Failed to get presigned URL for ${objectKey}`)
    }
    return url
  },
}
