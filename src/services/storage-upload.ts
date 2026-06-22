/**
 * storage-upload.ts — Image upload to Spring Boot storage API.
 *
 * POST /api/storage/upload (multipart/form-data) → MinIO → returns objectKey + presigned URL.
 */
import { apiClient } from './api-client'

export interface UploadResponse {
  objectKey: string
  url: string
  originalName: string
  contentType: string
  size: number
}

/**
 * Upload 1 image file to Spring Boot /api/storage/upload.
 *
 * @param uri — local file URI from expo-image-picker
 * @param type — MIME type (e.g. 'image/jpeg')
 * @param name — file name
 * @param prefix — optional folder prefix (e.g. 'products')
 * @returns UploadResponse with objectKey (save to product.imageKeys) + presigned URL
 */
export async function uploadImage(
  uri: string,
  type: string,
  name: string,
  prefix?: string,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', { uri, type, name } as unknown as Blob)
  if (prefix) {
    formData.append('prefix', prefix)
  }
  const res = await apiClient.post<{ data: UploadResponse }>(
    '/storage/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return res.data.data
}
