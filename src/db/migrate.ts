import { Logger, LogLevel } from '@graphile/logger'
import DistributedLock from '@ndustrial/node-distributed-lock'
import { readFileSync } from 'fs'
import { compile, migrate, reset, Settings, watch } from 'graphile-migrate'
import { resolve } from 'path'
import type { Pool } from 'pg'

import { FORCE_POST_MIGRATIONS, isTest } from '../env'
import logger from '../utils/logger'

let migrationLock: DistributedLock | undefined = undefined

const graphileLogger = new Logger((scope) => {
  const scopedLogger = logger.child({ scope })
  return (level, message) => {
    switch (level) {
      case LogLevel.ERROR:
        return scopedLogger.error(message)
      case LogLevel.WARNING:
        return scopedLogger.warn(message)
      case LogLevel.DEBUG:
        return scopedLogger.debug(message)
      case LogLevel.INFO:
      default:
        return scopedLogger.info(message)
    }
  }
})

function getSettings(path = '.gmrc.js'): Settings {
  const relativePath = resolve(process.cwd(), path)
  return {
    logger: graphileLogger,
    ...require(relativePath),
  }
}

export async function compileScript(filePath: string) {
  return await compile(getSettings(), readFileSync(filePath, 'utf8'))
}

export async function resetAndRunMigrations() {
  const settings = getSettings()
  await reset(settings)
  await afterMigrations(settings)
}

const afterMigrations = async (_settings: Settings) => {
  logger.info('Running afterMigrations hook...')
  // add hooks here
  logger.info('Hook completed')
  return Promise.resolve()
}

export async function runMigrations(connectionPool: Pool) {
  if (isTest) return

  const settings = getSettings()
  const { hostname } = new URL((connectionPool as any).options.connectionString)

  if (!migrationLock) {
    migrationLock = new DistributedLock('migrations', {
      queryInterface: connectionPool,
      lockTableName: 'private.distributed_lock',
    })
  }

  await migrationLock.lock(async () => {
    await migrate(settings, false, FORCE_POST_MIGRATIONS)
    await afterMigrations(settings)
  })

  // Only watch for changes in current.sql, in development using a local db
  if (hostname === 'localhost') return watch(settings)
}
