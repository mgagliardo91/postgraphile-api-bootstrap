function parseUrlWithDefaults(url: string, { pathname = '', search = {} }) {
  const parsed = new URL(url)
  parsed.pathname ||= pathname
  parsed.search ||= new URLSearchParams(search).toString()
  return parsed.toString()
}

/* =======================
 * POSTGRES
 * ======================== */
export const POSTGRES_URL = process.env.POSTGRES_URL
  ? parseUrlWithDefaults(process.env.POSTGRES_URL, { pathname: 'contxt' })
  : 'postgres://user:pass@localhost:5433/db'
export const POSTGRES_URL_ROOT =
  process.env.POSTGRES_URL_ROOT ?? new URL('template1', POSTGRES_URL).toString()
export const POSTGRES_URL_SHADOW =
  process.env.POSTGRES_URL_SHADOW ?? `${POSTGRES_URL}_shadow`

// PostGraphile's database role to assume when executing queries
export const POSTGRES_VISITOR =
  process.env.POSTGRES_VISITOR ?? new URL(POSTGRES_URL).username

export const PG_QUERY_TIMEOUT_MS: number = parseInt(
  process.env.PG_QUERY_TIMEOUT_MS ?? '120000',
)
export const PG_MAX_POOL_SIZE = parseInt(process.env.PG_MAX_POOL_SIZE ?? '2')
export const FORCE_POST_MIGRATIONS =
  (process.env.FORCE_POST_MIGRATIONS ?? 'true') === 'true'
