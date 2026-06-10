/**
 * use-customers.ts — React Query hooks for Customer API.
 *
 * Mirrors Next.js frontend pattern:
 * - useCustomersQuery (list with search/pagination)
 * - useCustomerQuery (detail by id)
 * - useCreateCustomerMutation
 * - useUpdateCustomerMutation
 * - useDeactivateCustomerMutation
 * - useCustomerOrdersQuery (purchase history)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as customerService from '@/services/customers'
import type {
  CustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
  OrderSummary,
} from '@/types/customer'

// ── Query keys factory ──
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => ['customers', 'list'] as const,
  list: (params: CustomerSearchParams) => ['customers', 'list', params] as const,
  details: () => ['customers', 'detail'] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
  orders: (id: string) => ['customers', 'orders', id] as const,
}

// ── Hooks ──

/** Danh sách khách hàng (phân trang + search) */
export function useCustomersQuery(params: CustomerSearchParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.listCustomers(params),
  })
}

/** Chi tiết 1 khách hàng */
export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  })
}

/** Tạo khách hàng mới */
export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

/** Cập nhật khách hàng */
export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
    },
  })
}

/** Xoá mềm khách hàng */
export function useDeactivateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customerService.deactivateCustomer(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
    },
  })
}

/** Lịch sử mua hàng */
export function useCustomerOrdersQuery(customerId: string, page = 1, size = 20) {
  return useQuery({
    queryKey: [...customerKeys.orders(customerId), page, size] as const,
    queryFn: () => customerService.getCustomerOrders(customerId, page, size),
    enabled: !!customerId,
  })
}
