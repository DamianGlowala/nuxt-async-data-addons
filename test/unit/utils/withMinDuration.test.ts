import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { withMinDuration } from '../../../src/runtime/utils/withMinDuration'

const MIN_DURATION = 1000

function trackSettled(promise: Promise<unknown>) {
  const onSettled = vi.fn()

  promise.then(onSettled, onSettled)

  return onSettled
}

describe('withMinDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('holds a fast resolve until minDuration has passed', async () => {
    const onSettled = trackSettled(withMinDuration(Promise.resolve('value'), MIN_DURATION))

    await vi.advanceTimersByTimeAsync(MIN_DURATION - 1)
    expect(onSettled).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onSettled).toHaveBeenCalledWith('value')
  })

  it('holds a fast rejection until minDuration has passed', async () => {
    const error = new Error('failed')
    const onSettled = trackSettled(withMinDuration(Promise.reject(error), MIN_DURATION))

    await vi.advanceTimersByTimeAsync(MIN_DURATION - 1)
    expect(onSettled).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onSettled).toHaveBeenCalledWith(error)
  })

  it('waits for a promise slower than minDuration', async () => {
    const { promise, resolve } = Promise.withResolvers<string>()
    const onSettled = trackSettled(withMinDuration(promise, MIN_DURATION))

    await vi.advanceTimersByTimeAsync(MIN_DURATION)
    expect(onSettled).not.toHaveBeenCalled()

    resolve('value')
    await vi.advanceTimersByTimeAsync(0)
    expect(onSettled).toHaveBeenCalledWith('value')
  })

  it('drops the remaining wait when aborted', async () => {
    const controller = new AbortController()
    const onSettled = trackSettled(withMinDuration(Promise.resolve('value'), MIN_DURATION, controller.signal))

    await vi.advanceTimersByTimeAsync(1)
    expect(onSettled).not.toHaveBeenCalled()

    controller.abort()
    await vi.advanceTimersByTimeAsync(0)
    expect(onSettled).toHaveBeenCalledWith('value')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not wait when already aborted', async () => {
    const onSettled = trackSettled(withMinDuration(Promise.resolve('value'), MIN_DURATION, AbortSignal.abort()))

    await vi.advanceTimersByTimeAsync(0)
    expect(onSettled).toHaveBeenCalledWith('value')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('removes its abort listener once settled', async () => {
    const { signal } = new AbortController()
    const addEventListener = vi.spyOn(signal, 'addEventListener')
    const removeEventListener = vi.spyOn(signal, 'removeEventListener')

    const result = withMinDuration(Promise.resolve('value'), MIN_DURATION, signal)
    await vi.advanceTimersByTimeAsync(MIN_DURATION)
    await result

    const [type, listener] = addEventListener.mock.calls[0]!
    expect(removeEventListener).toHaveBeenCalledWith(type, listener)
  })
})
