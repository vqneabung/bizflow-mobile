/**
 * auth.ts — Auth-related TypeScript types.
 */
export interface User {
  id?: string
  email: string
  role: string
  name?: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    token: string
    email: string
    role: string
    name?: string | null
  }
}
