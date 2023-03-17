import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createLogger, format, transports } from 'winston'

import { isDev, isTest, LOG_LEVEL } from '../env'

const { timestamp, combine, colorize, printf, json } = format

const simpleFormat = printf((info) => {
  const { level, message, timestamp } = info
  return `${timestamp} [${level}]: ${message}`
})

const upperCaseLevel = format((info) => {
  return {
    ...info,
    level: info.level.toUpperCase(),
  }
})

const consoleTransport = new transports.Console()

if (isTest) {
  consoleTransport.silent = true
}

const loggerFormat = [upperCaseLevel(), timestamp()]

if (isDev) {
  loggerFormat.push(...[colorize(), simpleFormat])
} else if (isTest) {
  loggerFormat.push(simpleFormat)
} else {
  loggerFormat.push(json())
}

const logger = createLogger({
  level: LOG_LEVEL.toLowerCase() ?? 'info',
  exitOnError: false,
  format: combine(...loggerFormat),
  transports: [consoleTransport],
})

export function setLogger(name: string) {
  const logDirectory = join(__dirname, '../../logs/')

  if (!existsSync(logDirectory)) {
    mkdirSync(logDirectory)
  }

  logger.add(
    new transports.File({
      filename: join(logDirectory, `log-${name}.txt`),
    }),
  )
}

export default logger
