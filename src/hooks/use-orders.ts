/**
 * use-orders.ts — React Query hooks for Order API.
 *
 * Mirrors use-customers pattern:
 * - useOrdersQuery (list with pagination/filter)
 * - useOrderQuery (detail by id)
 * - useCreateOrderMutation
 * - useCancelOrderMutation
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as orderService from '@/services/orders'
import type {
  CreateOrderRequest,
  OrderSearchParams,
} from '@/types/order'

// ── Query keys factory ──
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => ['orders', 'list'] as const,
  list: (params: OrderSearchParams) => ['orders', 'list', params] as const,
  details: () => ['orders', 'detail'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

// ── Hooks ──

/** Danh sách đơn hàng (phân trang + status filter + date range). */
export function useOrdersQuery(params: OrderSearchParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.listOrders(params),
  })
}

/** Chi tiết 1 đơn hàng */
export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrder(id),
    enabled: Boolean(id),
  })
}

/** Tạo đơn hàng mới */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/** Huỷ đơn hàng */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      orderService.cancelOrder(id, notes ? { notes } : undefined),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
    },
  })
}
