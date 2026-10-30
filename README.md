# nuxt-async-data-addons

[![npm version](https://img.shields.io/npm/v/nuxt-async-data-addons?color=00DC82)](https://npmjs.com/package/nuxt-async-data-addons)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-async-data-addons?color=00DC82)](https://npm.chart.dev/nuxt-async-data-addons)
[![license](https://img.shields.io/npm/l/nuxt-async-data-addons?color=00DC82)](./LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-%3E%3D4.6-00DC82?logo=nuxt)](https://nuxt.com)

A collection of common async data addons for Nuxt, for use with [`createUseAsyncData`](https://nuxt.com/docs/4.x/api/composables/create-use-async-data) and [`createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch).

Nuxt 4.6 added [`defineUseAsyncDataAddon`](https://nuxt.com/docs/4.x/api/utils/define-use-async-data-addon) and [`defineUseFetchAddon`](https://nuxt.com/docs/4.x/api/utils/define-use-fetch-addon), which package reusable behavior for your data fetching composables. This module saves you from writing the common ones yourself.

- [Try it on StackBlitz](https://stackblitz.com/github/DamianGlowala/nuxt-async-data-addons)

## Setup

```bash
npx nuxt module add nuxt-async-data-addons
```

Addons are auto-imported. Pass the ones you need to `createUseAsyncData` or `createUseFetch`, then use their options at the call site:

```ts [app/composables/useAppAsyncData.ts]
export const useAppAsyncData = createUseAsyncData({
  addons: [/* addons from this module */],
})
```

```ts [app/composables/useAppFetch.ts]
export const useAppFetch = createUseFetch({
  addons: [/* addons from this module */],
})
```

As `createUseAsyncData` and `createUseFetch` are compiler macros, these composables have to be exported declarations in a directory scanned by Nuxt, such as `app/composables/`.

## Contributing

```bash
# install dependencies
pnpm install

# generate type stubs and prepare the playgrounds
pnpm dev:prepare

# start the playground on Nuxt 4
pnpm dev

# start the playground on the latest Nuxt 5 nightly
pnpm dev:v5

# lint and type check
pnpm lint
pnpm test:types
```

Each addon has its own file in [`src/runtime/addons`](./src/runtime/addons), where every export is auto-imported, and its own page in [`playground/app/pages`](./playground/app/pages). `playground-v5` extends `playground` as a layer, so the same pages run on both Nuxt versions.

Commits follow [Conventional Commits](https://www.conventionalcommits.org), which [uppt](https://github.com/danielroe/uppt) uses to prepare releases.

## License

[MIT](./LICENSE)
