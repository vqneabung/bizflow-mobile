/**
 * use-stock-imports.ts — React Query hooks for Stock Import API.
 *
 * Mirrors use-orders pattern:
 * - useStockImportsQuery (list with pagination)
 * - useStockImportQuery (detail by id)
 * - useCreateStockImportMutation
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as stockImportService from '@/services/stock-imports'
import type {
  CreateStockImportRequest,
  StockImportSearchParams,
} from '@/types/stock-import'

// ── Query keys factory ──
export const stockImportKeys = {
  all: ['stock-imports'] as const,
  lists: () => ['stock-imports', 'list'] as const,
  list: (params: StockImportSearchParams) =>
    ['stock-imports', 'list', params] as const,
  details: () => ['stock-imports', 'detail'] as const,
  detail: (id: string) => ['stock-imports', 'detail', id] as const,
}

// ── Hooks ──

/** Danh sách phiếu nhập kho (phân trang). */
export function useStockImportsQuery(params: StockImportSearchParams = {}) {
  return useQuery({
    queryKey: stockImportKeys.list(params),
    queryFn: () => stockImportService.listStockImports(params),
  })
}

/** Chi tiết 1 phiếu nhập kho */
export function useStockImportQuery(id: string) {
  return useQuery({
    queryKey: stockImportKeys.detail(id),
    queryFn: () => stockImportService.getStockImport(id),
    enabled: Boolean(id),
  })
}

/** Tạo phiếu nhập kho mới */
export function useCreateStockImportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStockImportRequest) =>
      stockImportService.createStockImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockImportKeys.lists() })
    },
  })
}
