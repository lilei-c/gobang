import { Zobrist } from '../zobrist'
import { expect, test } from 'vitest'

const cache = new Zobrist({ size: 15 })
const cacheCode = cache.code

const loopCount = 2
for (let a = 0; a < loopCount; a++) {
  for (let i = 0; i < 15; i++)
    for (let j = 0; j < 15; j++) {
      cache.go(i, j, true)
      cache.go(i, j, false)
    }
}

test('Zobrist 走子+回退之后, code 应该不变', () => {
  expect(cache.code).toBe(cacheCode)
})
