/**
 * reports.ts — Reports API service.
 *
 * Gọi trực tiếp Spring Boot API (Axios instance đã auto-attach Bearer token).
 * Response format: ApiResponse<T> với wrapper { success, message, data: T }.
 *
 * Module READ-ONLY: không có mutation.
 */
import { apiClient } from './api-client'
import type {
  ApiResponse,
  ReportOverviewResponse,
  RevenueReportResponse,
  RevenueRange,
  BestSellingReportResponse,
  InventoryReportResponse,
  DebtReportResponse,
} from '@/types/report'

/** Tổng quan hệ thống (số liệu tháng này). */
export async function getOverview(): Promise<ApiResponse<ReportOverviewResponse>> {
  const res = await apiClient.get<ApiResponse<ReportOverviewResponse>>('/reports/overview')
  return res.data
}

/** Doanh thu theo range (7d | 30d | thisMonth). */
export async function getRevenue(
  range: RevenueRange = '30d',
): Promise<ApiResponse<RevenueReportResponse>> {
  const res = await apiClient.get<ApiResponse<RevenueReportResponse>>(
    `/reports/revenue?range=${range}`,
  )
  return res.data
}

/** Top sản phẩm bán chạy (mặc định 10). */
export async function getBestSelling(
  limit = 10,
): Promise<ApiResponse<BestSellingReportResponse>> {
  const res = await apiClient.get<ApiResponse<BestSellingReportResponse>>(
    `/reports/best-selling?limit=${limit}`,
  )
  return res.data
}

/** Báo cáo tồn kho (tổng SP, giá trị, low-stock, theo danh mục). */
export async function getInventory(): Promise<ApiResponse<InventoryReportResponse>> {
  const res = await apiClient.get<ApiResponse<InventoryReportResponse>>('/reports/inventory')
  return res.data
}

/** Báo cáo công nợ khách hàng. */
export async function getDebt(): Promise<ApiResponse<DebtReportResponse>> {
  const res = await apiClient.get<ApiResponse<DebtReportResponse>>('/reports/debt')
  return res.data
}
