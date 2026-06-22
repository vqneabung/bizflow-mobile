/**
 * use-reports.ts — React Query hooks for Reports API.
 *
 * READ-ONLY module: tất cả hooks là useQuery (không có mutation).
 * - useOverviewQuery
 * - useRevenueQuery(range)
 * - useBestSellingQuery(limit)
 * - useInventoryQuery
 * - useDebtQuery
 */
import { useQuery } from '@tanstack/react-query'
import * as reportService from '@/services/reports'
import type { RevenueRange } from '@/types/report'

// ── Query keys factory ──
export const reportKeys = {
  all: ['reports'] as const,
  overview: () => ['reports', 'overview'] as const,
  revenue: (range: RevenueRange) => ['reports', 'revenue', range] as const,
  bestSelling: (limit: number) => ['reports', 'best-selling', limit] as const,
  inventory: () => ['reports', 'inventory'] as const,
  debt: () => ['reports', 'debt'] as const,
}

// ── Hooks ──

/** Tổng quan hệ thống */
export function useOverviewQuery() {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: () => reportService.getOverview(),
  })
}

/** Doanh thu theo range */
export function useRevenueQuery(range: RevenueRange = '30d') {
  return useQuery({
    queryKey: reportKeys.revenue(range),
    queryFn: () => reportService.getRevenue(range),
  })
}

/** Top sản phẩm bán chạy */
export function useBestSellingQuery(limit = 10) {
  return useQuery({
    queryKey: reportKeys.bestSelling(limit),
    queryFn: () => reportService.getBestSelling(limit),
  })
}

/** Báo cáo tồn kho */
export function useInventoryQuery() {
  return useQuery({
    queryKey: reportKeys.inventory(),
    queryFn: () => reportService.getInventory(),
  })
}

/** Báo cáo công nợ */
export function useDebtQuery() {
  return useQuery({
    queryKey: reportKeys.debt(),
    queryFn: () => reportService.getDebt(),
  })
}
