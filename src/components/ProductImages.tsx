/**
 * ProductImages — Hiển thị hình ảnh sản phẩm với persistent cache.
 *
 * Layers:
 * 1. Hook: useImageUrls(keys) → { urls, isLoading, errors }
 * 2. Cache: MMKV persistent (50 phút TTL, mirror Next.js Dexie pattern)
 * 3. API: /api/storage/download-url via Spring Boot proxy
 * 4. Gallery: react-native-image-viewing (thay thế Galeria vì React 19 compat)
 *
 * States per image:
 * - Loading: skeleton (ActivityIndicator)
 * - Success: thumbnail (expo-image)
 * - Error: error text
 * - Tap: fullscreen ImageViewing modal
 */
import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native'
import { Image } from 'expo-image'
import ImageViewing from 'react-native-image-viewing'
import { useTranslation } from 'react-i18next'
import { useImageUrls } from '@/hooks/use-image-urls'

interface Props {
  imageKeys: string[]
}

const THUMB_SIZE = 100

export default function ProductImages({ imageKeys }: Props) {
  const { t } = useTranslation()
  const { urls, isLoading, errors } = useImageUrls(imageKeys)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  // Build images array for ImageViewing: [{ uri }] or null
  const imageViewingImages = useMemo(() => {
    const result: Array<{ uri: string }> = []
    for (const key of imageKeys) {
      const url = urls.get(key)
      if (url) result.push({ uri: url })
    }
    return result
  }, [imageKeys, urls])

  const openGallery = useCallback((index: number) => {
    setGalleryIndex(index)
    setShowGallery(true)
  }, [])

  // ── Empty state (no imageKeys) ──
  if (imageKeys.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('product.detail.noImages')}</Text>
      </View>
    )
  }

  // ── Initial loading (chưa có URL nào) ──
  if (isLoading && urls.size === 0) {
    return (
      <View style={styles.loadingContainer}>
        <FlatList
          horizontal
          data={Array(imageKeys.length).fill(null)}
          keyExtractor={(_, i) => `skeleton-${i}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbList}
          renderItem={() => (
            <View style={[styles.thumb, styles.skeleton]} />
          )}
        />
      </View>
    )
  }

  // ── Render thumbnails + errors ──
  return (
    <View>
      <FlatList
        horizontal
        data={imageKeys}
        keyExtractor={(key) => key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbList}
        renderItem={({ item: key, index }) => {
          const url = urls.get(key)
          const error = errors.get(key)

          // Error state
          if (error) {
            return (
              <View style={[styles.thumb, styles.errorBox]}>
                <Text style={styles.errorIcon}>⚠️</Text>
              </View>
            )
          }

          // Loading state (URL not yet resolved)
          if (!url) {
            return <View style={[styles.thumb, styles.skeleton]} />
          }

          // Success state
          return (
            <Pressable onPress={() => openGallery(index)}>
              <Image
                source={{ uri: url }}
                style={styles.thumb}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </Pressable>
          )
        }}
      />

      {/* Full-screen gallery via react-native-image-viewing */}
      <ImageViewing
        images={imageViewingImages}
        imageIndex={galleryIndex}
        visible={showGallery}
        onRequestClose={() => setShowGallery(false)}
        doubleTapToZoomEnabled
        swipeToCloseEnabled={Platform.OS === 'ios'}
        presentationStyle="fullScreen"
      />
    </View>
  )
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const styles = StyleSheet.create({
  loadingContainer: {
    paddingTop: 8,
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
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 20,
  },
})
