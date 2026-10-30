/**
 * Settles with the outcome of `promise`, but not before `minDuration` milliseconds have passed.
 * Rejections are held back too. Aborting `signal` drops the remaining wait.
 */
export async function withMinDuration<T>(promise: Promise<T>, minDuration: number, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) {
    return promise
  }

  const elapsed = new Promise<void>((resolve) => {
    const timer = setTimeout(done, minDuration)

    function done() {
      clearTimeout(timer)
      signal?.removeEventListener('abort', done)
      resolve()
    }

    signal?.addEventListener('abort', done, { once: true })
  })

  await Promise.allSettled([promise, elapsed])

  return promise
}
