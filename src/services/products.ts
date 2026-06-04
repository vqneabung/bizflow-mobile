/**
 * products.ts — Product API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format:
 *   List → PaginatedResponse<ProductResponse>
 *   Single → ApiResponse<ProductResponse>
 */
import { api } from './api'
import type {
  ProductResponse,
  PaginatedResponse,
  ApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchParams,
} from '@/types/product'

/**
 * Danh sách sản phẩm (phân trang + search + category filter).
 * page là 1-based (Spring Boot service tự convert xuống 0-based).
 */
export async function listProducts(
  params: ProductSearchParams = {},
): Promise<PaginatedResponse<ProductResponse>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const res = await api.get<PaginatedResponse<ProductResponse>>(
    `/products${qs ? '?' + qs : ''}`,
  )
  return res.data
}

/** Chi tiết sản phẩm */
export async function getProduct(
  id: string,
): Promise<ApiResponse<ProductResponse>> {
  const res = await api.get<ApiResponse<ProductResponse>>(`/products/${id}`)
  return res.data
}

/** Tạo sản phẩm mới */
export async function createProduct(
  data: CreateProductRequest,
): Promise<ApiResponse<ProductResponse>> {
  const res = await api.post<ApiResponse<ProductResponse>>('/products', data)
  return res.data
}

/** Cập nhật sản phẩm */
export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
): Promise<ApiResponse<ProductResponse>> {
  const res = await api.put<ApiResponse<ProductResponse>>(
    `/products/${id}`,
    data,
  )
  return res.data
}

/** Ẩn sản phẩm (soft delete) */
export async function deactivateProduct(
  id: string,
): Promise<ApiResponse<null>> {
  const res = await api.patch<ApiResponse<null>>(`/products/${id}/deactivate`)
  return res.data
}
