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
  category: string | null
  primaryUnit: string
  price: number
  costPrice: number | null
  stock: number
  minStock: number | null
  imageUrl: string | null
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
  primaryUnit: string
  price: number
  category?: string
  costPrice?: number
  stock?: number
  minStock?: number
  imageUrl?: string
  barcode?: string
}

/** PUT /api/products/{id} payload (all fields optional PATCH-style) */
export interface UpdateProductRequest {
  name?: string
  primaryUnit?: string
  price?: number
  category?: string
  costPrice?: number
  stock?: number
  minStock?: number
  imageUrl?: string
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
