import { gql, makeExtendSchemaPlugin } from 'graphile-utils'

import { DatabasePool } from '~src/db'

const tenantPlugin = makeExtendSchemaPlugin(() => {
  const typeDefs = gql`
    extend type Mutation {
      initializeTenant(slug: String!): Boolean
    }
  `

  const resolvers = {
    Mutation: {
      initializeTenant: async (
        _parent: unknown,
        args: Record<string, string>,
        context: { databasePool: DatabasePool },
        _info: unknown,
      ) => {
        const { databasePool } = context
        const { slug: tenantSlug } = args

        const tenant = await databasePool.oneOrNone<{ slug: string }>(
          `SELECT slug FROM tenants WHERE slug = $(tenantSlug)`,
          {
            tenantSlug,
          },
        )

        if (!tenant?.slug) {
          throw Error(`Invalid tenant slug: ${tenantSlug}`)
        }

        const exists = await databasePool.one<{ exists: boolean }>(
          `SELECT EXISTS (SELECT datname FROM pg_database WHERE datname = '${tenantSlug}')`,
        )

        if (exists.exists) {
          return
        }

        await databasePool.query(`CREATE DATABASE ${tenantSlug}`)
        await databasePool.query(
          `
          UPDATE tenants
          SET nionic_enabled = TRUE
          WHERE slug = $(tenantSlug)
        `,
          { tenantSlug },
        )
      },
    },
  }

  return {
    typeDefs,
    resolvers,
  }
})

export default tenantPlugin
