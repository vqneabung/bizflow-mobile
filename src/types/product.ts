/**
 * product.ts — Product data models.
 *
 * Maps to Spring Boot ProductController API responses:
 * - GET /api/products → PaginatedResponse<ProductResponse>
 * - GET /api/products/{id} → ApiResponse<ProductResponse>
 * - POST /api/products → ApiResponse<ProductResponse>
 * - PUT /api/products/{id} → ApiResponse<ProductResponse>
 * - PATCH /api/products/{id}/deactivate → ApiResponse<null>
 */

/** Product model returned from Spring Boot API */
export interface ProductResponse {
  id: string
  name: string
  categoryId: string | null
  categoryName: string | null
  primaryUnitId: string | null
  primaryUnitName: string | null
  price: number
  costPrice: number | null
  stock: number
  minStock: number | null
  imageKeys: string[]
  barcode: string | null
  isActive: boolean
  isLowStock: boolean
  createdAt: string
  updatedAt: string | null
}

/** Standard single-item response wrapper */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

/** Pagination metadata from Spring Boot */
export interface PaginationMeta {
  page: number        // 0-based from server
  size: number
  totalElements: number
  totalPages: number
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

/** POST /api/products payload */
export interface CreateProductRequest {
  name: string
  price: number
  categoryId?: string
  primaryUnitId?: string
  costPrice?: number
  stock?: number
  minStock?: number
  imageKeys?: string[]
  barcode?: string
}

/** PUT /api/products/{id} payload (all fields optional PATCH-style) */
export interface UpdateProductRequest {
  name?: string
  categoryId?: string
  primaryUnitId?: string
  price?: number
  costPrice?: number
  stock?: number
  minStock?: number
  imageKeys?: string[]
  barcode?: string
}

/** Query params for GET /api/products */
export interface ProductSearchParams {
  search?: string
  category?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

/**
 * Inventory movement history item (GET /api/products/{id}/inventory-history).
 * Tracked từ STOCK_IMPORT (nhập) hoặc ORDER (bán) → balanceAfter = tồn kho sau movement.
 */
export interface InventoryHistoryResponse {
  id: string
  productId: string
  movementType: 'IN' | 'OUT' | 'RETURN'
  quantity: number
  balanceAfter: number
  refType: 'STOCK_IMPORT' | 'ORDER'
  refId: string
  referenceNumber: string | null
  createdAt: string
}
