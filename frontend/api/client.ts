export interface ApiError {
  status: number
  message: string
  detail?: string
}

type QueryValue = string | number | boolean | null | undefined

let _token: string | null = null

export function setAccessToken(token: string | null) {
  _token = token
}

export function getAccessToken() {
  return _token
}

export function getBaseUrl() {
  const config = useRuntimeConfig()
  return String(config.public.apiBaseUrl || 'http://localhost:8000/api/v1')
}

export function buildQueryString(query?: Record<string, QueryValue>) {
  if (!query) return ''
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }

  const output = params.toString()
  return output ? `?${output}` : ''
}

export async function apiFetch<T>(path: string, options: RequestInit & { query?: Record<string, QueryValue> } = {}): Promise<T> {
  const requestId = crypto.randomUUID()
  const url = `${getBaseUrl()}${path}${buildQueryString(options.query)}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...(options.headers || {}),
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err: ApiError = {
      status: res.status,
      message: body?.message || body?.detail || 'Request failed',
      detail: body?.detail,
    }
    throw err
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const get = <T>(p: string, query?: Record<string, QueryValue>) => apiFetch<T>(p, { method: 'GET', query })
export const post = <T>(p: string, b?: unknown, query?: Record<string, QueryValue>) =>
  apiFetch<T>(p, { method: 'POST', body: b ? JSON.stringify(b) : undefined, query })
export const put = <T>(p: string, b?: unknown, query?: Record<string, QueryValue>) =>
  apiFetch<T>(p, { method: 'PUT', body: b ? JSON.stringify(b) : undefined, query })
export const patch = <T>(p: string, b?: unknown, query?: Record<string, QueryValue>) =>
  apiFetch<T>(p, { method: 'PATCH', body: b ? JSON.stringify(b) : undefined, query })
export const del = <T>(p: string, query?: Record<string, QueryValue>) => apiFetch<T>(p, { method: 'DELETE', query })
