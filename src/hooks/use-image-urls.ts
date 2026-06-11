/**
 * use-image-urls.ts — React hook resolve MinIO objectKeys → presigned URLs.
 *
 * Mirror of Next.js useImageUrls (batch version).
 *
 * Flow:
 * 1. Check MMKV cache (synchronous, per key)
 * 2. Cache hit & còn hạn → immediate return cached URL
 * 3. Cache miss hoặc hết hạn → fetch parallel via getImageUrls()
 * 4. Cache kết quả vào MMKV → return
 * 5. Cleanup on unmount: tránh setState sau khi component unmount
 *
 * Usage:
 *   const { urls, isLoading, errors } = useImageUrls(product.imageKeys)
 *   // urls.get('products/xxx.jpg') → presigned URL
 *
 * Nếu array rỗng → trả về empty Map, isLoading=false ngay lập tức.
 */
import { useEffect, useReducer } from 'react'
import { getImageUrls } from '@/services/image-cache'

// ── State shape ─────────────────────────────────────────

interface State {
  /** Map<objectKey, presignedUrl> */
  urls: Map<string, string>
  /** True khi đang fetch (cache miss) */
  isLoading: boolean
  /** Map<objectKey, errorMessage> — chỉ có key nào fetch fail */
  errors: Map<string, string>
}

const INITIAL_STATE: State = {
  urls: new Map(),
  isLoading: false,
  errors: new Map(),
}

// ── Actions ─────────────────────────────────────────────

type Action =
  | { type: 'reset' }
  | { type: 'loading' }
  | {
      type: 'success'
      urls: Map<string, string>
      errors: Map<string, string>
    }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return INITIAL_STATE
    case 'loading':
      return { ...INITIAL_STATE, isLoading: true }
    case 'success':
      return { urls: action.urls, errors: action.errors, isLoading: false }
  }
}

// ── Hook ────────────────────────────────────────────────

/**
 * Resolve nhiều objectKeys cùng lúc (batch) — dùng cho ProductImages.
 *
 * @param objectKeys Danh sách objectKey cần resolve
 * @returns { urls, isLoading, errors }
 */
export function useImageUrls(
  objectKeys: ReadonlyArray<string>,
): State {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Key dùng để trigger effect khi array thay đổi
  const key = objectKeys.join('|')

  useEffect(() => {
    if (objectKeys.length === 0) {
      dispatch({ type: 'reset' })
      return
    }

    dispatch({ type: 'loading' })

    let cancelled = false

    const entries = objectKeys.map((objectKey) => ({ objectKey }))

    getImageUrls(entries)
      .then((urlMap) => {
        if (cancelled) return

        const newErrors = new Map<string, string>()
        // Check xem key nào không có URL (fetch fail)
        for (const ok of objectKeys) {
          if (!urlMap.has(ok)) {
            newErrors.set(ok, 'Failed to load image')
          }
        }

        dispatch({ type: 'success', urls: urlMap, errors: newErrors })
      })
      .catch(() => {
        if (!cancelled) {
          const allErrors = new Map<string, string>()
          for (const ok of objectKeys) {
            allErrors.set(ok, 'Network error')
          }
          dispatch({ type: 'success', urls: new Map(), errors: allErrors })
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
