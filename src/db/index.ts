import pg, { IDatabase, IInitOptions } from 'pg-promise'
import { IClient, IConnectionParameters } from 'pg-promise/typescript/pg-subset'

import {
  isDev,
  isTest,
  PG_MAX_POOL_SIZE,
  PG_QUERY_TIMEOUT_MS,
  POSTGRES_URL,
} from '../env'
import { logger } from '../utils'

const pgpOptions: IInitOptions = {
  ...(isDev || isTest
    ? {
        query(e: { query: string }) {
          logger.debug(e.query)
        },
      }
    : {}),
  error(err, e) {
    logger.error(err, e)
  },
}

const buildDefaultConnectionParams = (
  connectionString: string,
  opts: Partial<IConnectionParameters<IClient>> = {},
) => ({
  connectionString,
  ...(PG_MAX_POOL_SIZE ? { max: PG_MAX_POOL_SIZE } : {}),
  connectionTimeoutMillis: PG_QUERY_TIMEOUT_MS,
  ...opts,
})

export type DatabasePool = IDatabase<Record<string, never>>

const pgp = pg(pgpOptions)
const pool: DatabasePool = pgp(buildDefaultConnectionParams(POSTGRES_URL))

export default pool
