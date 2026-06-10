/**
 * customer.ts — Customer data models.
 *
 * Maps to Spring Boot CustomerController API responses:
 * - GET  /api/customers       → PaginatedResponse<CustomerResponse>
 * - GET  /api/customers/{id}  → ApiResponse<CustomerResponse>
 * - POST /api/customers       → ApiResponse<CustomerResponse>
 * - PUT  /api/customers/{id}  → ApiResponse<CustomerResponse>
 * - PATCH /api/customers/{id}/deactivate → ApiResponse<null>
 * - GET  /api/customers/{id}/orders → PaginatedResponse<OrderSummary>
 */

/** Customer model returned from Spring Boot API */
export interface CustomerResponse {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  note: string | null
  totalDebt: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

/** POST /api/customers payload */
export interface CreateCustomerRequest {
  name: string
  phone?: string
  email?: string
  address?: string
  note?: string
}

/** PUT /api/customers/{id} payload (all fields optional) */
export interface UpdateCustomerRequest {
  name?: string
  phone?: string
  email?: string
  address?: string
  note?: string
}

/** Query params for GET /api/customers */
export interface CustomerSearchParams {
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

/** Order summary (from purchase history) */
export interface OrderSummary {
  id: string
  referenceNumber: string
  totalAmount: number
  status: string
  itemCount: number
  createdAt: string
}
