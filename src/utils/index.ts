export function safeExecute<T>(
  promise: () => Promise<T> | void | undefined,
): Promise<T | undefined> {
  return (async () => {
    try {
      const result = promise?.()
      if (result !== undefined) {
        return await result
      }
    } catch (e) {
      // do nothing
    }
  })()
}

export { default as logger } from './logger'
