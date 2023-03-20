import morgan from 'morgan'

import { isTest } from '../env'
import logger from './logger'

export default morgan(
  `:method :url :status :res[content-length] :remote-addr - :response-time ms`,
  {
    skip: (req) =>
      isTest ||
      req.url === '/healthz' ||
      req.method === 'OPTIONS' ||
      (req.url === '/graphql' &&
        req.method === 'POST' &&
        (req.body ?? {})?.operationName?.indexOf('IntrospectionQuery') >= 0),
    stream: {
      write: (msg) => logger.info(msg),
    },
  },
)
