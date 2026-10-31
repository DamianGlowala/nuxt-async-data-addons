# nuxt-async-data-addons

[![npm version](https://img.shields.io/npm/v/nuxt-async-data-addons?color=00DC82)](https://npmjs.com/package/nuxt-async-data-addons)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-async-data-addons?color=00DC82)](https://npm.chart.dev/nuxt-async-data-addons)
[![license](https://img.shields.io/npm/l/nuxt-async-data-addons?color=00DC82)](./LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-%3E%3D4.6-00DC82?logo=nuxt)](https://nuxt.com)

A collection of common async data addons for Nuxt, for use with [`createUseAsyncData`](https://nuxt.com/docs/4.x/api/composables/create-use-async-data) and [`createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch).

Nuxt 4.6 added [`defineUseAsyncDataAddon`](https://nuxt.com/docs/4.x/api/utils/define-use-async-data-addon) and [`defineUseFetchAddon`](https://nuxt.com/docs/4.x/api/utils/define-use-fetch-addon), which package reusable behavior for your data fetching composables. This module saves you from writing the common ones yourself.

- [Try it on StackBlitz](https://stackblitz.com/github/DamianGlowala/nuxt-async-data-addons?file=playground%2Fapp%2Fpages%2Findex.vue)

## Setup

```bash
npx nuxt module add nuxt-async-data-addons
```

Addons are auto-imported. Add the ones you need to `createUseAsyncData` or `createUseFetch`, optionally with default options for your project, then override those options at the call site when needed:

```ts [app/composables/useAppAsyncData.ts]
export const useAppAsyncData = createUseAsyncData({
  addons: [/* addons go here */],
})
```

```ts [app/composables/useAppFetch.ts]
export const useAppFetch = createUseFetch({
  addons: [/* addons go here */],
})
```

## Addons

### Minimum duration

| Addon | Use with |
| --- | --- |
| `minDurationUseAsyncDataAddon` | `createUseAsyncData` |
| `minDurationUseFetchAddon` | `createUseFetch` |

Keeps a request pending for at least `minDuration` milliseconds, so that loading states don't flash when it finishes quickly.

| Option | Type | Description |
| --- | --- | --- |
| `minDuration` | `number` | Minimum duration of the request in milliseconds. The addon does nothing when it is unset or `0`. |

Set `minDuration` on the addon to apply it by default, then pass it at the call site to override it for a single call.

```ts [app/composables/useAppAsyncData.ts]
export const useAppAsyncData = createUseAsyncData({
  addons: [minDurationUseAsyncDataAddon({ minDuration: 400 })],
})
```

```ts [app/composables/useAppFetch.ts]
export const useAppFetch = createUseFetch({
  addons: [minDurationUseFetchAddon({ minDuration: 400 })],
})
```

```vue [app/pages/index.vue]
<script setup lang="ts">
// stays pending for at least 400 ms on the client
const { data: mountains } = await useAppAsyncData(
  'mountains',
  () => $fetch('/api/mountains'),
)

// has no minimum duration
const { data: rivers } = await useAppFetch('/api/rivers', {
  minDuration: 0,
})
</script>
```

- It only applies on the client, so it never slows down server-side rendering. Data already in the payload is not re-fetched during hydration, so there is no wait there either.
- A request that fails early is also held for the minimum duration, so errors don't flash either.
- Aborting the request, or starting a new one for the same key, drops the remaining wait.

### Throw on error

| Addon | Use with |
| --- | --- |
| `throwOnErrorUseAsyncDataAddon` | `createUseAsyncData` |
| `throwOnErrorUseFetchAddon` | `createUseFetch` |

Makes a failed request reject the awaited composable, `refresh` and `execute`, instead of only setting the `error` ref.

| Option | Type | Description |
| --- | --- | --- |
| `throwOnError` | `boolean` | Rejects when the request fails. `refresh` and `execute` also accept it, which overrides the composable's option for that call. |

Set `throwOnError: true` on the addon to make failed requests reject by default, then pass `{ throwOnError: false }` to opt out for a single call. Without a default, each call opts in with `{ throwOnError: true }`.

```ts [app/composables/useStrictAsyncData.ts]
export const useStrictAsyncData = createUseAsyncData({
  addons: [throwOnErrorUseAsyncDataAddon({ throwOnError: true })],
})
```

```ts [app/composables/useStrictFetch.ts]
export const useStrictFetch = createUseFetch({
  addons: [throwOnErrorUseFetchAddon({ throwOnError: true })],
})
```

```vue [app/pages/index.vue]
<script setup lang="ts">
// shows the error page if this request fails, unless you catch it
const { data: mountains } = await useStrictAsyncData(
  'mountains',
  () => $fetch('/api/mountains'),
)

// only sets `error` if this request fails
const { data: rivers } = await useStrictFetch('/api/rivers', {
  throwOnError: false,
})

const { execute } = useStrictFetch('/api/submit', { immediate: false })

async function submit() {
  try {
    await execute()
  }
  catch (error) {
    // show validation errors next to the form, for example
  }
}
</script>
```

- `error` and `status` are still set before it rejects.
- An awaited composable marks its error as [`fatal`](https://nuxt.com/docs/4.x/getting-started/error-handling#createerror), so an uncaught failure shows the error page on the server and during client-side navigation. Use `try`/`catch` to handle it yourself, or [`<NuxtErrorBoundary>`](https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary) on the client.
- Requests started by watchers or `refreshNuxtData` never reject, because nothing could catch them. Their failures only set `error`.
- A `lazy` composable doesn't wait for its request on the client, so awaiting it doesn't reject there.
- Nuxt's types currently drop an addon's return value changes when it's combined with an addon that has none, such as `minDuration`. `execute({ throwOnError })` still works in that case but is a type error, while the `throwOnError` option on the composable itself stays typed.

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

# run the tests (the e2e tests need a browser: pnpm playwright-core install chromium)
pnpm test
```

Each addon has its own file in [`src/runtime/addons`](./src/runtime/addons), where every export is auto-imported, its own page in [`playground/app/pages`](./playground/app/pages), and its own checks in [`test/e2e/addons`](./test/e2e/addons), registered in [`describeAddons.ts`](./test/e2e/describeAddons.ts). Each addon is a function that takes default options. Where it applies to both composables, a file exports one per composable, such as `minDurationUseAsyncDataAddon` and `minDurationUseFetchAddon`. `playground-v5` extends `playground` as a layer, so the same pages run on both Nuxt versions.

Commits follow [Conventional Commits](https://www.conventionalcommits.org), which [uppt](https://github.com/danielroe/uppt) uses to prepare releases. Commits and pull requests about a specific addon use its name as the scope, such as `fix(minDuration): ...`.

## License

[MIT](./LICENSE)
