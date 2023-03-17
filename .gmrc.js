const { existsSync } = require('fs')

// In a production env, we'll be running in a container with `dist` only
const inContainer = !existsSync('./src')
const migrationsFolder = `./${inContainer ? 'dist' : 'src'}/db/migrations`

function withPort(url, port = 5432) {
  const parsed = new URL(url)
  parsed.port = port
  return parsed.toString()
}

/**
 * Load environment variables from `./src/env/index.ts`
 * Use `ts-node` to import typescript directly from javascript
 */
const loadEnv = () => {
  if (inContainer) return require('./dist/env/index.js')
  const compiler = require('ts-node').register({
    enabled: true,
    transpileOnly: true,
  })
  const env = require('./src/env/index.ts')
  compiler.enabled(false)
  return env
}

const {
  POSTGRES_URL_ROOT,
  POSTGRES_URL_SHADOW,
  POSTGRES_URL,
  POSTGRES_VISITOR,
} = loadEnv()

/**
 * Configuration options
 * See more at https://github.com/graphile/migrate#configuration
 */
module.exports = {
  connectionString: POSTGRES_URL,
  rootConnectionString: POSTGRES_URL_ROOT,
  shadowConnectionString: POSTGRES_URL_SHADOW,
  migrationsFolder,
  pgSettings: {
    search_path: 'public',
  },
  placeholders: {
    ':POSTGRES_VISITOR': POSTGRES_VISITOR
  },
  afterAllMigrations: [
    // Dump the schema
    {
      _: 'command',
      shadow: true,
      command:
        `docker compose exec -T db pg_dump --schema-only --no-owner --no-sync -n public -n private "${withPort(POSTGRES_URL)}" >schemas/schema.sql`,
    },
  ],
}
