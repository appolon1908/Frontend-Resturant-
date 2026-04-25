import { post, get, del } from '~/api/client'
import type { TokenPair, TokenRefreshRequest, RegisterRequest } from '~/types/api'

export const authApi = {
  login(emailOrPayload: string | { email: string; password: string }, password?: string) {
    const payload =
      typeof emailOrPayload === 'string'
        ? { email: emailOrPayload, password: password || '' }
        : { email: emailOrPayload.email, password: emailOrPayload.password }
    return post<TokenPair>('/public/auth/jwt/login/', payload)
  },

  register(payload: RegisterRequest) {
    return post<TokenPair>('/auth/register/', payload)
  },

  refresh(payload: TokenRefreshRequest) {
    return post<TokenPair>('/auth/refresh/', payload)
  },

  logout() {
    return post<void>('/auth/logout')
  },

  listSessions() {
    return get<Array<{ id: number; created_at: string; is_current: boolean }>>('/auth/sessions/')
  },

  sessions() {
    return get<Array<{ id: number; created_at: string; is_current: boolean }>>('/auth/sessions/')
  },

  revokeSession(id: number) {
    return del<void>(`/auth/sessions/${id}/`)
  },

  me() {
    return get('/auth/me/')
  },
}
