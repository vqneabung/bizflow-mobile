/**
 * storage.ts — MinIO/Storage service.
 *
 * Gọi Spring Boot proxy để lấy presigned download URL.
 * Cache kết quả trong memory để tránh gọi lại API cho cùng objectKey.
 */
import { apiClient } from './api-client'

const cache = new Map<string, string>()

export interface DownloadUrlResponse {
  url: string
}

/**
 * Lấy presigned download URL cho 1 objectKey.
 * Kết quả được cache trong memory (TTL phụ thuộc vào backend).
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
