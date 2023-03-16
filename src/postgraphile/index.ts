import retry from 'async-retry'
import * as Express from 'express'
import { Pool } from 'pg'
import postgraphile, { HttpRequestHandler } from 'postgraphile'
import { setTimeout } from 'timers/promises'

import { runMigrations } from '../db/migrate'
import { POSTGRES_URL } from '../env'
import buildDefaultOptions from './options'

class PostgraphileServer {
  private postgraphilePool: Pool
  private postgraphileHandler: HttpRequestHandler

  async start(app: Express.Application) {
    const options = buildDefaultOptions([])
    this.postgraphilePool = new Pool({
      connectionString: POSTGRES_URL,
    })
    await runMigrations(this.postgraphilePool)
    this.postgraphileHandler = postgraphile(
      this.postgraphilePool,
      ['public'],
      options,
    )
    app.use(this.postgraphileHandler)
    await this.waitForListener()
  }

  waitForListener = async (): Promise<void> => {
    const parsed = new URL(POSTGRES_URL)
    const databaseName = parsed.pathname.slice(1)

    const fetchListeners = async () => {
      const {
        rows: [result],
      } = await this.postgraphilePool.query<{ listeners: string }>(
        `SELECT count(*) as listeners FROM pg_stat_activity WHERE query = 'listen postgraphile_watch' AND datname = $1;`,
        [databaseName],
      )
      if (parseInt(result.listeners) == 0) {
        throw new Error(
          `Unable to locate postgraphile watch listener for datname ${databaseName}.`,
        )
      }
    }

    await setTimeout(500)
    await retry(fetchListeners, { retries: 5 })
  }

  async close(): Promise<void> {
    await this.postgraphileHandler.release()
  }
}

export default PostgraphileServer
