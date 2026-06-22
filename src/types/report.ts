/**
 * report.ts — Report data models.
 *
 * Maps to Spring Boot ReportController API:
 * - GET /api/reports/overview       → ApiResponse<ReportOverviewResponse>
 * - GET /api/reports/revenue        → ApiResponse<RevenueReportResponse>
 * - GET /api/reports/best-selling   → ApiResponse<BestSellingReportResponse>
 * - GET /api/reports/inventory      → ApiResponse<InventoryReportResponse>
 * - GET /api/reports/debt           → ApiResponse<DebtReportResponse>
 */
import type { ApiResponse } from './product'

export type { ApiResponse }

export type RevenueRange = '7d' | '30d' | 'thisMonth'

export interface ReportOverviewResponse {
  totalProducts: number
  ordersThisMonth: number
  revenueThisMonth: number
  totalCustomers: number
  lowStockCount: number
}

export interface RevenueDailyPoint {
  date: string
  revenue: number
}

export interface RevenueReportResponse {
  points: RevenueDailyPoint[]
  total: number
  periodStart: string
  periodEnd: string
}

export interface BestSellingProduct {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export interface BestSellingReportResponse {
  products: BestSellingProduct[]
}

export interface CategoryCount {
  categoryName: string | null
  count: number
}

export interface LowStockProduct {
  productId: string
  productName: string
  stock: number
  minStock: number
}

export interface InventoryReportResponse {
  totalProducts: number
  totalValue: number
  lowStockProducts: LowStockProduct[]
  byCategory: CategoryCount[]
}

export interface CustomerDebt {
  customerId: string | null
  customerName: string
  totalDebt: number
  orderCount: number
}

export interface DebtReportResponse {
  totalDebt: number
  customers: CustomerDebt[]
}
