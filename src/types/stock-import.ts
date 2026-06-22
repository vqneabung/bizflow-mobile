/**
 * stock-import.ts — Stock import data models.
 *
 * Maps to Spring Boot StockImportController API:
 * - POST /api/stock-imports     → ApiResponse<StockImportResponse>
 * - GET  /api/stock-imports     → PaginatedResponse<StockImportSummaryResponse>
 * - GET  /api/stock-imports/{id} → ApiResponse<StockImportResponse>
 *
 * Note: No update/delete endpoints — stock already updated after create.
 */
import type { ApiResponse, PaginatedResponse } from './product'

export type { ApiResponse, PaginatedResponse } from './product'

/** Single line item in a stock import */
export interface StockImportItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  subtotal: number
}

/** Stock import detail (with items) */
export interface StockImportResponse {
  id: string
  ownerId: string
  referenceNumber: string
  supplier: string | null
  notes: string | null
  importDate: string
  totalCost: number
  itemCount: number
  items: StockImportItemResponse[]
  createdAt: string
  updatedAt: string | null
}

/** Stock import summary (list view) */
export interface StockImportSummaryResponse {
  id: string
  referenceNumber: string
  supplier: string | null
  importDate: string
  totalCost: number
  itemCount: number
  createdAt: string
}

/** POST /api/stock-imports payload — single item */
export interface CreateStockImportItemRequest {
  productId: string
  quantity: number
  unitCost: number
}

/** POST /api/stock-imports payload */
export interface CreateStockImportRequest {
  referenceNumber?: string
  supplier?: string
  notes?: string
  importDate?: string
  items: CreateStockImportItemRequest[]
}

/** Query params for GET /api/stock-imports */
export interface StockImportSearchParams {
  page?: number
  size?: number
}
