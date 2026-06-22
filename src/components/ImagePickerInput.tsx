/**
 * ImagePickerInput.tsx — Image picker + uploader using expo-image-picker.
 *
 * Shows list of selected image objectKeys with remove buttons + "Thêm ảnh" button.
 * On pick → upload to Spring Boot → returns updated objectKeys to parent via onKeysChange.
 *
 * Props:
 * - imageKeys: string[] — current object keys
 * - onKeysChange: (keys: string[]) => void — callback when keys change
 * - maxImages?: number (default 5)
 */
import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTranslation } from 'react-i18next'
import { uploadImage } from '@/services/storage-upload'

interface Props {
  imageKeys: string[]
  onKeysChange: (keys: string[]) => void
  maxImages?: number
}

export function ImagePickerInput({
  imageKeys,
  onKeysChange,
  maxImages = 5,
}: Props) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddImage = async () => {
    if (imageKeys.length >= maxImages) {
      setError(t('product.create.imagesMaxReached'))
      return
    }
    setError(null)

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      setError(t('product.create.imagesPermissionDenied'))
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (result.canceled) return

    const asset = result.assets[0]
    if (!asset) return

    setUploading(true)
    try {
      const response = await uploadImage(
        asset.uri,
        asset.mimeType ?? 'image/jpeg',
        asset.fileName ?? `photo-${Date.now()}.jpg`,
        'products',
      )
      onKeysChange([...imageKeys, response.objectKey])
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : t('product.create.imagesUploadFailed')
      setError(message)
      Alert.alert(t('product.create.imagesUploadFailed'), message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    onKeysChange(imageKeys.filter((_, i) => i !== index))
  }

  return (
    <View style={styles.container}>
      {imageKeys.length === 0 && !error && (
        <Text style={styles.hint}>{t('product.create.imagesEmpty')}</Text>
      )}

      {imageKeys.map((key, index) => (
        <View key={`${key}-${index}`} style={styles.item}>
          <Text style={styles.itemText} numberOfLines={1}>
            {key.split('/').pop() ?? key}
          </Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveImage(index)}
            accessibilityLabel={t('product.create.imagesRemove')}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.addBtn, uploading && { opacity: 0.5 }]}
        onPress={handleAddImage}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addBtnText}>
            {t('product.create.addImage')}
            {imageKeys.length > 0 ? ` (${imageKeys.length}/${maxImages})` : ''}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    color: '#dc2626',
  },
})
