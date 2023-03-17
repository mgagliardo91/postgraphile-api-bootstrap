import PgAggregates from '@graphile/pg-aggregates'
import PgManyToManyPlugin from '@graphile-contrib/pg-many-to-many'
import PgSimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector'
import type { Plugin } from 'graphile-build'
import type { PostGraphileOptions } from 'postgraphile'
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter'
import { PgMutationUpsertPlugin } from 'postgraphile-upsert-plugin'

import { isDev, ORIGINAL_ERRORS, POSTGRES_VISITOR } from '../env'

export default (additionalPlugins: Plugin[] = []): PostGraphileOptions => ({
  pgSettings() {
    return {
      role: POSTGRES_VISITOR,
    }
  },
  graphileBuildOptions: {
    connectionFilterAllowNullInput: true,
  },
  enableCors: false,
  allowExplain: isDev,
  disableQueryLog: true,
  dynamicJson: true,
  enableQueryBatching: true,
  enhanceGraphiql: true,
  exportGqlSchemaPath: isDev ? 'schemas/schema.graphql' : undefined,
  ...(isDev && ORIGINAL_ERRORS
    ? {
        extendedErrors: isDev ? ['hint', 'detail', 'errcode'] : ['errcode'],
        showErrorStack: true,
      }
    : {}),
  graphiql: isDev,
  ignoreIndexes: true,
  ignoreRBAC: false,
  legacyRelations: 'omit',
  retryOnInitFail: !isDev,
  setofFunctionsContainNulls: false,
  sortExport: true,
  subscriptions: true,
  watchPg: true,
  appendPlugins: [
    PgAggregates,
    PgMutationUpsertPlugin,
    ...additionalPlugins,
    PgSimplifyInflectorPlugin,
    ConnectionFilterPlugin,
    PgManyToManyPlugin,
  ],
})
