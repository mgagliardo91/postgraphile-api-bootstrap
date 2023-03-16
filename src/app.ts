import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { isObject } from 'lodash'
import morgan from 'morgan'
import { AddressInfo } from 'net'
import { promisify } from 'util'

import createLandingPage from './apollo/landingPage'
import { isTest, PORT } from './env'
import PostgraphileServer from './postgraphile'
import { logger, safeExecute } from './utils'

function isAddressInfo(
  addressInfo: string | AddressInfo | null,
): addressInfo is AddressInfo {
  return addressInfo != null && isObject(addressInfo) && 'port' in addressInfo
}

export default async (serverPort: number = PORT) => {
  let isServerHealthy = false

  logger.info('nio-internal initializing...')
  const app = express()
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      skip: (req) =>
        isTest ||
        req.url === '/healthz' ||
        req.method === 'OPTIONS' ||
        (req.url === '/graphql' &&
          req.method === 'POST' &&
          (req.body ?? {})?.operationName?.indexOf('IntrospectionQuery') >= 0),
    }),
  )

  app.use(
    cors({
      origin: [
        /localhost/, // Local development
        /ndustrial\.io/, // Our own apps
        'https://studio.apollographql.com', // Apollo's explorer
      ],
      credentials: true,
    }),
  )

  app.get('/healthz', (_, res) =>
    isServerHealthy ? res.send({ status: 'OK' }) : res.status(503),
  )

  if (!isTest) {
    await createLandingPage(app)
  }

  const httpServer = createServer(app)
  const postgraphileServer = new PostgraphileServer()
  await postgraphileServer.start(app)
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: serverPort }, resolve),
  )
  const address = httpServer.address()
  const graphileServerPort = isAddressInfo(address) ? address.port : serverPort

  app.use(compression())
  app.get('/', (_, res) => res.redirect('/graphql'))

  const shutdown = async () => {
    await safeExecute(promisify(httpServer.close).bind(httpServer))
    await safeExecute(() => postgraphileServer.close())
  }

  isServerHealthy = true
  logger.info(
    `🚀 Server ready at http://localhost:${graphileServerPort}/graphql`,
  )
  return { app, shutdown, port: graphileServerPort }
}
