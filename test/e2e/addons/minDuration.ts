import { $fetch, createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const MIN_DURATION = 1000

export function describeMinDuration() {
  describe('minDuration', () => {
    it('does not hold back server-side rendering', async () => {
      await $fetch('/min-duration')

      const start = Date.now()
      const html = await $fetch<string>('/min-duration')

      expect(Date.now() - start).toBeLessThan(MIN_DURATION)
      expect(html).toMatch(/minDurationUseAsyncDataAddon[^<]*success/)
      expect(html).toMatch(/minDurationUseFetchAddon[^<]*success/)
    })

    it.each([
      'minDurationUseAsyncDataAddon',
      'minDurationUseFetchAddon',
    ])('%s holds a client-side refresh for its default minDuration', async (addon) => {
      const page = await createPage('/min-duration')
      const row = (name: string) => page.locator('p', { hasText: name })

      const start = Date.now()
      await page.getByRole('button', { name: 'Refresh' }).click()

      await row('without addon').filter({ hasText: 'success' }).waitFor()
      expect(await row(addon).textContent()).toContain('pending')

      await row(addon).filter({ hasText: 'success' }).waitFor()
      expect(Date.now() - start).toBeGreaterThanOrEqual(MIN_DURATION)

      await page.close()
    })

    it.each([
      ['minDurationUseAsyncDataAddon', 'useAsyncData with minDuration: 0'],
      ['minDurationUseFetchAddon', 'useFetch with minDuration: 0'],
    ])('%s lets a call override its default', async (addon, override) => {
      const page = await createPage('/min-duration')
      const row = (name: string) => page.locator('p', { hasText: name })

      await page.getByRole('button', { name: 'Refresh' }).click()

      await row(override).filter({ hasText: 'success' }).waitFor()
      expect(await row(addon).textContent()).toContain('pending')

      await page.close()
    })
  })
}
