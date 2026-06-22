/**
 * stock-imports.ts — Stock import API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format:
 *   List   → PaginatedResponse<StockImportSummaryResponse>
 *   Single → ApiResponse<StockImportResponse>
 *   Create → ApiResponse<StockImportResponse>
 */
import { apiClient } from './api-client'
import type {
  StockImportResponse,
  StockImportSummaryResponse,
  CreateStockImportRequest,
  StockImportSearchParams,
} from '@/types/stock-import'
import type { ApiResponse, PaginatedResponse } from '@/types/product'

/** Danh sách phiếu nhập kho (phân trang). */
export async function listStockImports(
  params: StockImportSearchParams = {},
): Promise<PaginatedResponse<StockImportSummaryResponse>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))

  const qs = query.toString()
  const res = await apiClient.get<
    PaginatedResponse<StockImportSummaryResponse>
  >(`/stock-imports${qs ? '?' + qs : ''}`)
  return res.data
}

/** Chi tiết phiếu nhập kho (kèm items). */
export async function getStockImport(
  id: string,
): Promise<ApiResponse<StockImportResponse>> {
  const res = await apiClient.get<ApiResponse<StockImportResponse>>(
    `/stock-imports/${id}`,
  )
  return res.data
}

/** Tạo phiếu nhập kho mới (tự động cộng tồn kho). */
export async function createStockImport(
  data: CreateStockImportRequest,
): Promise<ApiResponse<StockImportResponse>> {
  const res = await apiClient.post<ApiResponse<StockImportResponse>>(
    '/stock-imports',
    data,
  )
  return res.data
}
