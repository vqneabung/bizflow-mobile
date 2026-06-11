/**
 * image-cache.ts — Image cache layer with MMKV (persistent key-value storage).
 *
 * Mirror of Next.js Dexie-based image-cache.ts but using React Native MMKV.
 *
 * Why MMKV:
 * - Synchronous reads (no await needed for cache check)
 * - ~30x faster than AsyncStorage
 * - Persistent across app restarts
 * - No IndexedDB dependency needed
 *
 * Presigned URL TTL:
 * - Backend: 60 minutes (minioProperties.presignedUrlExpiry = 3600s)
 * - Cache:  50 minutes (safely under expiry to avoid stale URLs)
 *
 * Cache key format: "img:<objectKey>"
 * Cache value: JSON { presignedUrl, cachedAt, productUpdatedAt? }
 */
import { createMMKV } from 'react-native-mmkv'
import { storageApi } from './storage'

// ── MMKV instance ──────────────────────────────────────

const storage = createMMKV({ id: 'bizflow-image-cache' })

// ── Config ─────────────────────────────────────────────

/** Cache TTL = 50 phút (MinIO presigned URL mặc định 60 phút) */
const CACHE_TTL = 50 * 60 * 1000

// ── Types ──────────────────────────────────────────────

interface CachedImage {
  objectKey: string
  presignedUrl: string
  cachedAt: number
  productUpdatedAt?: string
}

// ── Helpers ────────────────────────────────────────────

function cacheKey(objectKey: string): string {
  return `img:${objectKey}`
}

// ── Public API ─────────────────────────────────────────

/**
 * Lấy presigned URL cho object key.
 * Cache-aware: nếu cache còn hạn → return cached, nếu hết → fetch mới.
 */
export async function getImageUrl(
  objectKey: string,
  productUpdatedAt?: string,
): Promise<string> {
  // 1. Check cache (synchronous)
  const cachedJson = storage.getString(cacheKey(objectKey))
  if (cachedJson) {
    const cached: CachedImage = JSON.parse(cachedJson)
    const isExpired = Date.now() - cached.cachedAt > CACHE_TTL
    const isStale =
      productUpdatedAt != null &&
      cached.productUpdatedAt !== productUpdatedAt

    if (!isExpired && !isStale) {
      return cached.presignedUrl
    }
  }

  // 2. Cache miss — fetch from API
  const url = await storageApi.getImageUrl(objectKey)

  // 3. Store in cache
  const entry: CachedImage = {
    objectKey,
    presignedUrl: url,
    cachedAt: Date.now(),
    productUpdatedAt,
  }
  storage.set(cacheKey(objectKey), JSON.stringify(entry))

  return url
}

/**
 * Batch lấy presigned URLs cho nhiều object keys cùng lúc.
 * Mỗi key check cache trước, chỉ fetch những key chưa có hoặc hết hạn.
 */
export async function getImageUrls(
  entries: Array<{ objectKey: string; productUpdatedAt?: string }>,
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const toFetch: Array<{ objectKey: string; productUpdatedAt?: string }> = []

  // 1. Check cache cho từng key
  for (const entry of entries) {
    const cachedJson = storage.getString(cacheKey(entry.objectKey))
    if (cachedJson) {
      const cached: CachedImage = JSON.parse(cachedJson)
      const isExpired = Date.now() - cached.cachedAt > CACHE_TTL
      const isStale =
        entry.productUpdatedAt != null &&
        cached.productUpdatedAt !== entry.productUpdatedAt

      if (!isExpired && !isStale) {
        result.set(entry.objectKey, cached.presignedUrl)
        continue
      }
    }
    toFetch.push(entry)
  }

  // 2. Fetch tất cả keys bị miss trong parallel
  const fetched = await Promise.allSettled(
    toFetch.map(async (entry) => {
      const url = await storageApi.getImageUrl(entry.objectKey)
      return { ...entry, url }
    }),
  )

  // 3. Save kết quả vào cache + return
  for (const f of fetched) {
    if (f.status === 'fulfilled') {
      const { objectKey, url, productUpdatedAt } = f.value
      result.set(objectKey, url)
      const entry: CachedImage = {
        objectKey,
        presignedUrl: url,
        cachedAt: Date.now(),
        productUpdatedAt,
      }
      storage.set(cacheKey(objectKey), JSON.stringify(entry))
    }
  }

  return result
}

/**
 * Xóa cache cho 1 object key.
 * Dùng khi xóa file hoặc khi biết URL đã hết hạn.
 */
export function invalidateImageCache(objectKey: string): void {
  storage.remove(cacheKey(objectKey))
}

/**
 * Xóa cache cho tất cả ảnh của 1 product (dùng prefix match).
 * Vì MMKV không support prefix search, phải iter qua keys.
 */
export function invalidateProductImages(productId: string): void {
  const prefix = cacheKey(`products/${productId}/`)
  const keys = storage.getAllKeys()
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      storage.remove(key)
    }
  }
}

/**
 * Xóa toàn bộ image cache (khi logout).
 */
export function clearAllImageCache(): void {
  const keys = storage.getAllKeys()
  for (const key of keys) {
    if (key.startsWith('img:')) {
      storage.remove(key)
    }
  }
}
