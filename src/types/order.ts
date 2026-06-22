/**
 * order.ts — Order data models.
 *
 * Maps to Spring Boot OrderController API:
 * - POST   /api/orders            → ApiResponse<OrderResponse>
 * - GET    /api/orders            → PaginatedResponse<OrderSummaryResponse>
 * - GET    /api/orders/{id}       → ApiResponse<OrderResponse>
 * - PATCH  /api/orders/{id}/cancel → ApiResponse<null>
 */
import type { ApiResponse, PaginatedResponse } from './product'

export type { ApiResponse, PaginatedResponse } from './product'

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'

/** Order detail with items */
export interface OrderItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderResponse {
  id: string
  customerId: string | null
  referenceNumber: string
  totalAmount: number
  paidAmount: number
  debtAmount: number
  status: OrderStatus
  notes: string | null
  itemCount: number
  items: OrderItemResponse[]
  createdAt: string
  updatedAt: string | null
}

/** Order summary (list view) */
export interface OrderSummaryResponse {
  id: string
  referenceNumber: string
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  debtAmount: number
  itemCount: number
  createdAt: string
}

/** POST /api/orders payload */
export interface CreateOrderItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderRequest {
  status: OrderStatus
  customerId?: string
  notes?: string
  items: CreateOrderItemRequest[]
}

/** PATCH /api/orders/{id}/cancel payload */
export interface CancelOrderRequest {
  notes?: string
}

/** Query params for GET /api/orders */
export interface OrderSearchParams {
  page?: number
  size?: number
  status?: OrderStatus
  fromDate?: string
  toDate?: string
}
