import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ref, refreshNuxtData, useThrowByDefaultAsyncData, useThrowByDefaultFetch, useThrowOnErrorAsyncData, useThrowOnErrorFetch } from '#imports'

let id = 0

const fail = () => {
  throw new Error('failed')
}

const asyncDataCaller = (composable: typeof useThrowOnErrorAsyncData) =>
  (handler: () => unknown, options?: Record<string, unknown>) =>
    composable(`throw-on-error-${++id}`, async () => handler(), options)

const fetchCaller = (composable: typeof useThrowOnErrorFetch) =>
  (handler: () => unknown, options?: Record<string, unknown>) => {
    const url = `/throw-on-error-${++id}`

    registerEndpoint(url, handler)

    return composable(url, { key: url, ...options })
  }

describe.each([
  {
    name: 'throwOnErrorUseAsyncDataAddon',
    use: asyncDataCaller(useThrowOnErrorAsyncData),
    useWithDefault: asyncDataCaller(useThrowByDefaultAsyncData),
  },
  {
    name: 'throwOnErrorUseFetchAddon',
    use: fetchCaller(useThrowOnErrorFetch),
    useWithDefault: fetchCaller(useThrowByDefaultFetch),
  },
])('$name', ({ use, useWithDefault }) => {
  it('rejects by default when the addon sets the option', async () => {
    await expect(useWithDefault(fail)).rejects.toThrow()
    await expect(useWithDefault(fail, { immediate: false }).execute()).rejects.toThrow()
  })

  it('lets the composable override the default', async () => {
    const { status } = await useWithDefault(fail, { throwOnError: false })

    expect(status.value).toBe('error')
  })

  it('lets `execute` override the default', async () => {
    const { execute } = useWithDefault(fail, { immediate: false })

    await expect(execute({ throwOnError: false })).resolves.toBeUndefined()
  })

  it('rejects when awaited, with the error ref and status still set', async () => {
    const asyncData = use(fail, { throwOnError: true })

    await expect(asyncData).rejects.toThrow()
    expect(asyncData.status.value).toBe('error')
    expect(asyncData.error.value).toBeTruthy()
  })

  it('rejects `.catch()` handlers on the composable', async () => {
    let caught: unknown

    await use(fail, { throwOnError: true }).catch((error: unknown) => {
      caught = error
    })

    expect(caught).toBeTruthy()
  })

  it('resolves when awaited without the option', async () => {
    const { status } = await use(fail)

    expect(status.value).toBe('error')
  })

  it('resolves when awaited with `lazy`, as it does not wait for the request', async () => {
    const failLater = () => new Promise((_, reject) => setTimeout(reject, 10, new Error('failed')))
    const { status } = await use(failLater, { lazy: true, throwOnError: true })

    expect(status.value).toBe('pending')
  })

  it('resolves when the request succeeds', async () => {
    const { data } = await use(() => 'value', { throwOnError: true })

    expect(data.value).toBe('value')
  })

  it.each(['refresh', 'execute'] as const)('rejects `%s()` with the option', async (method) => {
    const asyncData = use(fail, { immediate: false, throwOnError: true })

    await expect(asyncData[method]()).rejects.toThrow()
  })

  it('lets a call turn the option off', async () => {
    const { execute, status } = use(fail, { immediate: false, throwOnError: true })

    await expect(execute({ throwOnError: false })).resolves.toBeUndefined()
    expect(status.value).toBe('error')
  })

  it('lets a call turn the option on', async () => {
    const { execute } = use(fail, { immediate: false })

    await expect(execute({ throwOnError: true })).rejects.toThrow()
  })

  it('does not reject once a later request succeeds', async () => {
    let shouldFail = true
    const { execute } = use(() => shouldFail ? fail() : 'value', { immediate: false, throwOnError: true })

    await expect(execute()).rejects.toThrow()

    shouldFail = false
    await expect(execute()).resolves.toBeUndefined()
  })

  it('does not rethrow an earlier error when disabled', async () => {
    const enabled = ref(true)
    const { execute, status } = use(fail, { enabled, immediate: false, throwOnError: true })

    await expect(execute()).rejects.toThrow()

    enabled.value = false
    await expect(execute()).resolves.toBeUndefined()
    expect(status.value).toBe('error')
  })

  it('keeps watcher-triggered failures in the error ref', async () => {
    const source = ref(0)
    const { error, status } = use(() => source.value ? fail() : 'value', { throwOnError: true, watch: [source] })

    await flushPromises()
    expect(error.value).toBeFalsy()

    source.value++
    await expect.poll(() => status.value).toBe('error')
    expect(error.value).toBeTruthy()
  })

  it('keeps `refreshNuxtData` failures in the error ref', async () => {
    let shouldFail = false
    const { status } = await use(() => shouldFail ? fail() : 'value', { throwOnError: true })

    shouldFail = true
    await expect(refreshNuxtData()).resolves.toBeUndefined()
    expect(status.value).toBe('error')
  })
})
