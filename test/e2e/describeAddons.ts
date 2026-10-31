import { createResolver } from '@nuxt/kit'
import { setup } from '@nuxt/test-utils/e2e'
import { describe } from 'vitest'
import { describeMinDuration } from './addons/minDuration'
import { describeThrowOnError } from './addons/throwOnError'

const { resolve } = createResolver(import.meta.url)

export function describeAddons(name: string, rootDir: string) {
  describe(name, async () => {
    await setup({
      rootDir: resolve(rootDir),
      server: true,
      browser: true,
    })

    describeMinDuration()
    describeThrowOnError()
  })
}
