import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'
import pkg from '../package.json' with { type: 'json' }

export default defineNuxtModule({
  meta: {
    name: pkg.name,
    version: pkg.version,
    compatibility: {
      nuxt: '>=4.6.0',
    },
  },
  setup() {
    const { resolve } = createResolver(import.meta.url)

    addImportsDir(resolve('./runtime/addons'))
  },
})
