import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => new Date().toISOString())
