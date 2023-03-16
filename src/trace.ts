import type { Tracer } from 'dd-trace'

let tracer: Tracer | undefined

if (process.env.DD_AGENT_HOST) {
  tracer = require('dd-trace').init() // eslint-disable-line @typescript-eslint/no-var-requires
}

export default tracer
