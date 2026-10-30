import { createResolver } from '@nuxt/kit'
import { setup } from '@nuxt/test-utils/e2e'
import { describe } from 'vitest'
import { describeMinDuration } from './addons/minDuration'

const { resolve } = createResolver(import.meta.url)

export function describeAddons(name: string, rootDir: string) {
  describe(name, async () => {
    await setup({
      rootDir: resolve(rootDir),
      server: true,
      browser: true,
    })

    describeMinDuration()
  })
}
