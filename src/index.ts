require('./trace') // eslint-disable-line @typescript-eslint/no-var-requires

import asyncExitHook from 'async-exit-hook'
import { callbackify } from 'util'

import createApp from './app'

let shutdown: (() => Promise<void>) | undefined = undefined

asyncExitHook((done) => {
  if (!done) {
    return
  }

  return shutdown ? callbackify(shutdown)(done) : done()
})

// eslint-disable-next-line @typescript-eslint/no-floating-promises
createApp().then((app) => {
  shutdown = app.shutdown
})
