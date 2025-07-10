import { edenFetch, treaty } from '@elysiajs/eden'
import type { App } from '@/index'
import { BASE_API_URL } from '../constant'

export const client = treaty<App>(BASE_API_URL, {
  fetch: {
    credentials: "include",
  }
})

export const fetch = edenFetch<App>(BASE_API_URL, {
  credentials: "include",
})