import { isDev } from './environment'

export const LOG_LEVEL = process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info')
export const PORT = parseInt(process.env.PORT ?? '3000', 10)

export const ORIGINAL_ERRORS =
  (process.env.ORIGINAL_ERRORS ?? 'false') === 'true'

export const ENABLE_PLAYGROUND =
  (process.env.ENABLE_PLAYGROUND ?? 'true') === 'true'
