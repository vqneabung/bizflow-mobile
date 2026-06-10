/**
 * customers.ts — Customer API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format:
 *   List   → PaginatedResponse<CustomerResponse>
 *   Single → ApiResponse<CustomerResponse>
 */
import { apiClient } from './api-client'
import type {
  CustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
  OrderSummary,
} from '@/types/customer'

/**
 * Danh sách khách hàng (phân trang + search).
 * page là 1-based (Spring Boot service tự convert xuống 0-based).
 */
export async function listCustomers(
  params: CustomerSearchParams = {},
): Promise<{ success: boolean; message: string; data: CustomerResponse[]; pagination: { page: number; size: number; totalElements: number; totalPages: number } }> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const res = await apiClient.get(`/customers${qs ? '?' + qs : ''}`)
  return res.data
}

/** Chi tiết khách hàng */
export async function getCustomer(
  id: string,
): Promise<{ success: boolean; message: string; data?: CustomerResponse }> {
  const res = await apiClient.get(`/customers/${id}`)
  return res.data
}

/** Tạo khách hàng mới */
export async function createCustomer(
  data: CreateCustomerRequest,
): Promise<{ success: boolean; message: string; data?: CustomerResponse }> {
  const res = await apiClient.post('/customers', data)
  return res.data
}

/** Cập nhật khách hàng */
export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest,
): Promise<{ success: boolean; message: string; data?: CustomerResponse }> {
  const res = await apiClient.put(`/customers/${id}`, data)
  return res.data
}

/** Ẩn khách hàng (soft delete) */
export async function deactivateCustomer(
  id: string,
): Promise<{ success: boolean; message: string; data?: null }> {
  const res = await apiClient.patch(`/customers/${id}/deactivate`)
  return res.data
}

/** Lấy lịch sử mua hàng của khách */
export async function getCustomerOrders(
  id: string,
  page = 1,
  size = 20,
): Promise<{ success: boolean; message: string; data: OrderSummary[]; pagination: { page: number; size: number; totalElements: number; totalPages: number } }> {
  const res = await apiClient.get(`/customers/${id}/orders?page=${page}&size=${size}`)
  return res.data
}
