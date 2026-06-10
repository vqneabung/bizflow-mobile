/**
 * ProductImages — Hiển thị hình ảnh sản phẩm.
 *
 * Horizontal FlatList thumbnails → tap để mở Galeria fullscreen với zoom/pan.
 * Yêu cầu:
 * - expo-image (performant image component)
 * - @nandorojo/galeria (fullscreen gallery)
 * - src/services/storage.ts (presigned URL via backend proxy)
 *
 * Cần dùng `npx expo run:android` vì Galeria yêu cầu Fabric/Native.
 */
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { getDownloadUrl } from '@/services/storage'

interface Props {
  imageKeys: string[]
}

export default function ProductImages({ imageKeys }: Props) {
  const { t } = useTranslation()
  const [urls, setUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const resolved = await Promise.all(imageKeys.map(getDownloadUrl))
        if (!cancelled) setUrls(resolved)
      } catch {
        // silent — hiển thị empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (imageKeys.length > 0) {
      load()
    } else {
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [imageKeys])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7c3aed" />
      </View>
    )
  }

  if (urls.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('product.detail.noImages')}</Text>
      </View>
    )
  }

  return (
    <View>
      {/* Thumbnails */}
      <FlatList
        horizontal
        data={urls}
        keyExtractor={(url) => url}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbList}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => { setGalleryIndex(index); setShowGallery(true) }}>
            <Image
              source={{ uri: item }}
              style={styles.thumb}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        )}
      />

      {/* Full-screen gallery via Galeria */}
      {showGallery && (
        <GaleriaViewer
          urls={urls}
          initialIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </View>
  )
}

/**
 * Galeria inline component — dynamic import khi Galeria thực sự cần.
 */
function GaleriaViewer({
  urls,
  initialIndex,
  onClose,
}: {
  urls: string[]
  initialIndex: number
  onClose: () => void
}) {
  // Dynamic import để tránh lỗi nếu Galeria chưa cài
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Galeria } = require('@nandorojo/galeria')
    return (
      <Galeria
        visible
        images={urls.map((url) => ({ url }))}
        initialIndex={initialIndex}
        onClose={onClose}
      />
    )
  } catch {
    return null
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: '#999' },
  thumbList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
})
