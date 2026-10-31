import { defineUseAsyncDataAddon, defineUseFetchAddon } from '#app'
import type { AsyncDataAddonInstance, NuxtError, UseAsyncDataAddon, UseAsyncDataAddonOptions, UseFetchAddon } from '#app'
import { toValue } from '#imports'

export interface ThrowOnErrorAddonOptions {
  /** Rejects the awaited composable, `refresh` and `execute` when the request fails. */
  throwOnError?: boolean
}

type Execute = (options?: Parameters<AsyncDataAddonInstance['refresh']>[0] & ThrowOnErrorAddonOptions) => Promise<void>

export interface ThrowOnErrorAddonExtension {
  refresh: Execute
  execute: Execute
}

function createSetup(defaults: ThrowOnErrorAddonOptions = {}) {
  return ({ throwOnError = defaults.throwOnError, enabled }: Pick<UseAsyncDataAddonOptions<ThrowOnErrorAddonOptions>, 'throwOnError' | 'enabled'>) => {
    return (asyncData: AsyncDataAddonInstance) => {
      // Only the returned `refresh` and `execute` are replaced. Nuxt's watchers and `refreshNuxtData`
      // keep using its internal `execute`, so background requests can't cause unhandled rejections.
      const { refresh } = asyncData

      // A disabled request doesn't run, so its status and error would be from an earlier one.
      function getFailure() {
        if (asyncData.status.value === 'error' && toValue(enabled) !== false) {
          return asyncData.error.value as NuxtError
        }
      }

      const execute: Execute = async (executeOptions) => {
        await refresh(executeOptions)

        const failure = getFailure()

        if (failure && (executeOptions?.throwOnError ?? throwOnError)) {
          throw failure
        }
      }

      return {
        refresh: execute,
        execute,
        then: (next: Promise<unknown>['then'], ...handlers: Parameters<Promise<unknown>['then']>) => next((value) => {
          const failure = getFailure()

          if (failure && throwOnError) {
            // Uncaught non-fatal errors leave a blank page during client-side navigation.
            throw Object.assign(failure, { fatal: true })
          }

          return value
        }).then(...handlers),
      }
    }
  }
}

/**
 * Rejects the awaited composable, `refresh` and `execute` from `createUseAsyncData`
 * when the request fails, instead of only setting the `error` ref.
 *
 * @param defaults Options for calls that don't set their own.
 */
export function throwOnErrorUseAsyncDataAddon(defaults?: ThrowOnErrorAddonOptions): UseAsyncDataAddon<ThrowOnErrorAddonOptions, ThrowOnErrorAddonExtension> {
  return defineUseAsyncDataAddon<ThrowOnErrorAddonOptions, ThrowOnErrorAddonExtension>({ setup: createSetup(defaults) })
}

/**
 * Rejects the awaited composable, `refresh` and `execute` from `createUseFetch`
 * when the request fails, instead of only setting the `error` ref.
 *
 * @param defaults Options for calls that don't set their own.
 */
export function throwOnErrorUseFetchAddon(defaults?: ThrowOnErrorAddonOptions): UseFetchAddon<ThrowOnErrorAddonOptions, ThrowOnErrorAddonExtension> {
  return defineUseFetchAddon<ThrowOnErrorAddonOptions, ThrowOnErrorAddonExtension>({ setup: createSetup(defaults) })
}
