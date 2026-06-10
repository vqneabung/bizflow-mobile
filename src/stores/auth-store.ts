/**
 * auth-store.ts — Zustand store for auth state.
 *
 * Uses Zustand instead of React Context so that:
 * - Non-React code (axios interceptors) can read/clear the store
 * - No Provider wrapper needed (faster, simpler)
 * - Store can be accessed via useAuthStore.getState() anywhere
 */
import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  /** User đã login chưa */
  isAuthenticated: boolean
  /** Đang kiểm tra token (loading) */
  isLoading: boolean
  /** Thông tin user hiện tại */
  user: User | null

  /** Set session after login/register */
  setSession: (user: User) => void
  /** Clear session on logout or 401 */
  clearSession: () => void
  /** Set loading state */
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  setSession: (user) =>
    set({ isAuthenticated: true, isLoading: false, user }),

  clearSession: () =>
    set({ isAuthenticated: false, user: null }),
  // Note: isLoading NOT reset to true here — we're already loaded,
  // just session expired. AuthGuard will redirect to login.

  setLoading: (loading) => set({ isLoading: loading }),
}))
