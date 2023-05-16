import { Application, Request } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

import { isProd } from './env'

const env = isProd ? 'prod' : 'staging'
const getRoutingPath = (req: Request) =>
  `http://nionic-api-${req.params.tenant}.nionic-${env}.svc.cluster.local`

export default (app: Application) => {
  app.use(
    '/proxy/:tenant',
    createProxyMiddleware({
      changeOrigin: true,
      router: getRoutingPath,
      logLevel: 'debug',
      pathRewrite: (path, req) => {
        const newPath = path.replace(`/proxy/${req.params.tenant}`, '')
        return newPath === '' ? '/graphql' : newPath
      },
    }),
  )
}
