import { stat } from 'fs/promises'
import { globSync } from 'glob'
import type { Config } from 'jest'
import { parse } from 'path'

type TestType = 'unit' | 'integration'
const testDirectory = '__tests__'

const defaultConfig: Config = {
  verbose: true,
  testTimeout: 60000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist'],
  slowTestThreshold: 30,
  setupFilesAfterEnv: ['<rootDir>/__tests__/__setup__/setup.ts'],
  ci: true,
  testRunner: 'jest-circus/runner',
  moduleNameMapper: {
    '^~src/(.*)$': '<rootDir>/src/$1',
  },
  testRegex: [`${testDirectory}.*\\.(unit|int)\\..*`],
}

const overrides: {
  [key in TestType]: Partial<Config>
} = {
  unit: {
    testRegex: [`${testDirectory}.*\\.(unit)\\..*`],
  },
  integration: {
    testRegex: [`${testDirectory}.*\\.(int)\\..*`],
    globalSetup: '<rootDir>/__tests__/__setup__/globalSetup.ts',
    globalTeardown: '<rootDir>/__tests__/__setup__/globalTeardown.ts',
    maxWorkers: process.env.JEST_MAX_WORKERS ?? '75%',
    silent: false,
    bail: true,
  },
}

async function getOrderedFiles() {
  const matching = globSync(`${testDirectory}/**/*.int.test.ts`)
  const testFiles: [string, number][] = await Promise.all(
    matching.map(async (result) => {
      const file = await stat(result)
      return [result, file.size]
    }),
  )

  return testFiles
    .sort((inputA, inputB) => inputA[1] - inputB[1])
    .map((i) => i[0])
}

export default (async () => {
  const { PARALLELISM, P_INDEX, TEST_TYPE } = process.env
  const type: TestType | undefined = TEST_TYPE as TestType
  const parallelism = parseInt(PARALLELISM ?? '1')
  const pIndex = parseInt(P_INDEX ?? '0')
  const parallelismOverrides: Partial<Config> = {}

  if (pIndex >= parallelism || pIndex < 0) {
    throw new Error(
      `Invalid pIndex value of ${pIndex} for parallelism ${parallelism}`,
    )
  }

  if (type === 'integration' && parallelism > 1) {
    console.log(`Running with parallelism ${parallelism} for pIndex: ${pIndex}`)
    const results = await getOrderedFiles()
    const filtered = results.filter((_, index) => {
      return index % parallelism === pIndex
    })
    parallelismOverrides.testRegex = [...filtered]
    console.log(
      `Running tests:\n${filtered
        .map((i) => `- ${parse(i).base}`)
        .join('\n')}\n`,
    )
  }

  return {
    ...defaultConfig,
    ...(type ? overrides[type] : {}),
    ...parallelismOverrides,
  }
})()
