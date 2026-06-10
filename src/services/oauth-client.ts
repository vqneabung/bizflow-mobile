/**
 * oauth-client.ts — Axios instance for auth-only endpoints.
 *
 * This client is used for login and register — endpoints that do NOT
 * need a Bearer token (they return one instead).
 *
 * No request/response interceptors for token management.
 */
import axios from 'axios'
import { ENV } from '@/config/env'

export const oauthClient = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api`,
  timeout: ENV.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})
