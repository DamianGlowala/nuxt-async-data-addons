import { defineUseAsyncDataAddon, defineUseFetchAddon } from '#app'
import type { UseAsyncDataAddon, UseAsyncDataAddonOptions, UseFetchAddon } from '#app'
import { withMinDuration } from '../utils/withMinDuration'

export interface MinDurationAddonOptions {
  /** Minimum duration of a client-side request in milliseconds. */
  minDuration?: number
}

function createSetup(defaults: MinDurationAddonOptions = {}) {
  return ({ minDuration = defaults.minDuration, middleware }: Pick<UseAsyncDataAddonOptions<MinDurationAddonOptions>, 'minDuration' | 'middleware'>) => {
    if (!import.meta.client || !minDuration) {
      return
    }

    middleware.push((next, { signal }) => withMinDuration(next(), minDuration, signal))
  }
}

/**
 * Keeps a client-side request from `createUseAsyncData` pending for at least `minDuration` milliseconds,
 * which prevents loading states from flashing when it finishes quickly.
 *
 * @param defaults Options for calls that don't set their own.
 */
export function minDurationUseAsyncDataAddon(defaults?: MinDurationAddonOptions): UseAsyncDataAddon<MinDurationAddonOptions> {
  return defineUseAsyncDataAddon<MinDurationAddonOptions>({ setup: createSetup(defaults) })
}

/**
 * Keeps a client-side request from `createUseFetch` pending for at least `minDuration` milliseconds,
 * which prevents loading states from flashing when it finishes quickly.
 *
 * @param defaults Options for calls that don't set their own.
 */
export function minDurationUseFetchAddon(defaults?: MinDurationAddonOptions): UseFetchAddon<MinDurationAddonOptions> {
  return defineUseFetchAddon<MinDurationAddonOptions>({ setup: createSetup(defaults) })
}
