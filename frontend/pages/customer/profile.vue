<script setup lang="ts">
definePageMeta({ layout: 'customer' })

import { authApi } from '~/api/auth'

type SessionRow = {
  id: number
  created_at: string
  is_current: boolean
}

const { auth, logout, handleApiError } = useAuth()

const loading = ref(true)
const error = ref('')
const me = ref<any | null>(null)
const sessions = ref<SessionRow[]>([])
const revokingId = ref<number | null>(null)

async function loadProfile() {
  loading.value = true
  error.value = ''

  try {
    const [meResult, sessionResult] = await Promise.all([
      authApi.me(),
      authApi.listSessions(),
    ])

    me.value = meResult
    sessions.value = sessionResult
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load profile.')
  } finally {
    loading.value = false
  }
}

await loadProfile()

async function revokeSession(id: number) {
  revokingId.value = id

  try {
    await authApi.revokeSession(id)
    sessions.value = sessions.value.filter((session) => session.id !== id)
  } catch (err) {
    error.value = handleApiError(err, 'Unable to revoke session.')
  } finally {
    revokingId.value = null
  }
}

async function logoutNow() {
  try {
    await logout()
    await navigateTo('/auth/login')
  } catch (err) {
    error.value = handleApiError(err, 'Unable to log out.')
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

const currentUser = computed(() => me.value ?? auth.user ?? null)
const otherSessions = computed(() => sessions.value.filter((session) => !session.is_current))
const currentSession = computed(() => sessions.value.find((session) => session.is_current) ?? null)
</script>

<template>
  <section class="space-y-5">
    <div>
      <h1 class="section-title">Profile</h1>
      <p class="section-subtitle">
        Account details and active sessions.
      </p>
    </div>

    <p
      v-if="error"
      class="error-banner"
    >
      {{ error }}
    </p>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <AppSkeleton :lines="3" />
      <AppSkeleton :lines="4" />
      <AppSkeleton :lines="2" />
    </div>

    <template v-else>
      <AppCard>
        <h2 class="mb-4 text-lg font-semibold text-slate-900">
          Account
        </h2>

        <dl class="grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Username
            </dt>
            <dd class="mt-1 text-sm text-slate-800">
              {{ currentUser?.username || '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </dt>
            <dd class="mt-1 text-sm text-slate-800">
              {{ currentUser?.email || '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phone
            </dt>
            <dd class="mt-1 text-sm text-slate-800">
              {{ currentUser?.phone || '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Role
            </dt>
            <dd class="mt-1 text-sm text-slate-800">
              {{ currentUser?.role || 'customer' }}
            </dd>
          </div>
        </dl>
      </AppCard>

      <AppCard>
        <h2 class="mb-4 text-lg font-semibold text-slate-900">
          Active sessions
        </h2>

        <div
          v-if="currentSession"
          class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        >
          <p class="text-sm font-medium text-emerald-700">
            Current session
          </p>
          <p class="mt-1 text-sm text-emerald-600">
            Started {{ formatDate(currentSession.created_at) }}
          </p>
        </div>

        <AppEmptyState
          v-if="!otherSessions.length"
          title="No other active sessions"
        >
          You are only signed in on this device right now.
        </AppEmptyState>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="session in otherSessions"
            :key="session.id"
            class="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-medium text-slate-900">
                Session #{{ session.id }}
              </p>
              <p class="text-sm text-slate-500">
                Started {{ formatDate(session.created_at) }}
              </p>
            </div>

            <AppButton
              variant="secondary"
              :loading="revokingId === session.id"
              @click="revokeSession(session.id)"
            >
              Revoke
            </AppButton>
          </div>
        </div>
      </AppCard>

      <AppCard class="border border-rose-200 bg-rose-50">
        <h2 class="mb-2 text-lg font-semibold text-rose-700">
          Logout
        </h2>
        <p class="mb-4 text-sm text-rose-600">
          Sign out of this device.
        </p>

        <AppButton @click="logoutNow">
          Logout
        </AppButton>
      </AppCard>
    </template>
  </section>
</template>
