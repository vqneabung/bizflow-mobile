/**
 * orders.ts — Order API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format:
 *   List    → PaginatedResponse<OrderSummaryResponse>
 *   Single  → ApiResponse<OrderResponse>
 *   Cancel  → ApiResponse<null>
 */
import { apiClient } from './api-client'
import type {
  OrderResponse,
  OrderSummaryResponse,
  CreateOrderRequest,
  CancelOrderRequest,
  OrderSearchParams,
} from '@/types/order'
import type { ApiResponse, PaginatedResponse } from '@/types/product'

/** Danh sách đơn hàng (phân trang + filter theo status + fromDate/toDate). */
export async function listOrders(
  params: OrderSearchParams = {},
): Promise<PaginatedResponse<OrderSummaryResponse>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))
  if (params.status) query.set('status', params.status)
  if (params.fromDate) query.set('fromDate', params.fromDate)
  if (params.toDate) query.set('toDate', params.toDate)

  const qs = query.toString()
  const res = await apiClient.get<PaginatedResponse<OrderSummaryResponse>>(
    `/orders${qs ? '?' + qs : ''}`,
  )
  return res.data
}

/** Chi tiết đơn hàng */
export async function getOrder(
  id: string,
): Promise<ApiResponse<OrderResponse>> {
  const res = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${id}`)
  return res.data
}

/** Tạo đơn hàng mới */
export async function createOrder(
  data: CreateOrderRequest,
): Promise<ApiResponse<OrderResponse>> {
  const res = await apiClient.post<ApiResponse<OrderResponse>>('/orders', data)
  return res.data
}

/** Huỷ đơn hàng */
export async function cancelOrder(
  id: string,
  data?: CancelOrderRequest,
): Promise<ApiResponse<null>> {
  const res = await apiClient.patch<ApiResponse<null>>(
    `/orders/${id}/cancel`,
    data ?? {},
  )
  return res.data
}
