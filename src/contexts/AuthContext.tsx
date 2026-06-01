/**
 * AuthContext — Auth state management cho toàn app.
 *
 * Dùng React Context thay vì Zustand để đơn giản (không cần thêm dep).
 * Flow:
 * 1. App start → check token trong SecureStore
 * 2. Có token → set isAuthenticated = true → show Dashboard
 * 3. Không có token → show LoginScreen
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getToken, getStoredUser, loginUser, logoutUser, registerUser, type User } from '@/services/auth'

interface AuthContextType {
  /** User đã login chưa */
  isAuthenticated: boolean
  /** Đang kiểm tra token (loading) */
  isLoading: boolean
  /** Thông tin user hiện tại */
  user: User | null
  /** Login function */
  login: (email: string, password: string) => Promise<void>
  /** Register function */
  register: (email: string, password: string, name?: string) => Promise<void>
  /** Logout function */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // Kiểm tra token khi app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken()
        if (token) {
          const storedUser = await getStoredUser()
          setUser(storedUser)
          setIsAuthenticated(true)
        }
      } catch {
        // Lỗi → coi như chưa login
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const userData = await loginUser(email, password)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const register = async (email: string, password: string, name?: string) => {
    const userData = await registerUser(email, password, name)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
