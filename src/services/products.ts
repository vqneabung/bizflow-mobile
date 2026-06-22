/**
 * products.ts — Product API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format:
 *   List → PaginatedResponse<ProductResponse>
 *   Single → ApiResponse<ProductResponse>
 */
import { apiClient } from './api-client'
import type {
  ProductResponse,
  PaginatedResponse,
  ApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchParams,
  InventoryHistoryResponse,
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
  const res = await apiClient.get<PaginatedResponse<ProductResponse>>(
    `/products${qs ? '?' + qs : ''}`,
  )
  return res.data
}

/** Chi tiết sản phẩm */
export async function getProduct(
  id: string,
): Promise<ApiResponse<ProductResponse>> {
  const res = await apiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`)
  return res.data
}

/** Tạo sản phẩm mới */
export async function createProduct(
  data: CreateProductRequest,
): Promise<ApiResponse<ProductResponse>> {
  const res = await apiClient.post<ApiResponse<ProductResponse>>('/products', data)
  return res.data
}

/** Cập nhật sản phẩm */
export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
): Promise<ApiResponse<ProductResponse>> {
  const res = await apiClient.put<ApiResponse<ProductResponse>>(
    `/products/${id}`,
    data,
  )
  return res.data
}

/** Ẩn sản phẩm (soft delete) */
export async function deactivateProduct(
  id: string,
): Promise<ApiResponse<null>> {
  const res = await apiClient.patch<ApiResponse<null>>(`/products/${id}/deactivate`)
  return res.data
}

/**
 * Lịch sử xuất/nhập/hoàn tồn kho của 1 sản phẩm (phân trang, page 1-based).
 * Gồm các movement: STOCK_IMPORT (nhập), ORDER (bán), RETURN (hoàn trả).
 */
export async function getInventoryHistory(
  productId: string,
  page = 1,
  size = 20,
): Promise<PaginatedResponse<InventoryHistoryResponse>> {
  const res = await apiClient.get<PaginatedResponse<InventoryHistoryResponse>>(
    `/products/${productId}/inventory-history?page=${page}&size=${size}`,
  )
  return res.data
}
