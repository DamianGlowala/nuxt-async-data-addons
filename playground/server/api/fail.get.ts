import { createError, defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => {
  throw createError({ status: 418, statusText: 'I\'m a teapot' })
})
