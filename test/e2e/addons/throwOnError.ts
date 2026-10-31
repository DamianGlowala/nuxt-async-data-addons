import { createPage, fetch } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

export function describeThrowOnError() {
  describe('throwOnError', () => {
    it.each([
      ['throwOnErrorUseAsyncDataAddon', ''],
      ['throwOnErrorUseFetchAddon', '?addon=fetch'],
    ])('%s fails server-side rendering of an awaited request', async (_addon, query) => {
      const response = await fetch(`/throw-on-error/await${query}`)

      expect(response.status).toBe(418)
    })

    it('shows the error page when an awaited request fails during client-side navigation', async () => {
      const page = await createPage('/throw-on-error')

      await page.getByRole('link', { name: 'Await a failing request' }).click()
      await page.getByRole('heading', { name: '418' }).waitFor()

      expect(page.url()).toContain('/throw-on-error/await')

      await page.close()
    })

    it.each([
      'throwOnErrorUseAsyncDataAddon',
      'throwOnErrorUseFetchAddon',
    ])('%s rejects a client-side execute unless told not to', async (addon) => {
      const page = await createPage('/throw-on-error')
      const section = page.locator('section', { hasText: addon })
      const outcome = section.locator('p')

      await section.getByRole('button', { name: 'execute()', exact: true }).click()
      await outcome.filter({ hasText: 'rejected, status error' }).waitFor()

      await section.getByRole('button', { name: 'execute({ throwOnError: false })' }).click()
      await outcome.filter({ hasText: 'resolved, status error' }).waitFor()

      await page.close()
    })
  })
}
