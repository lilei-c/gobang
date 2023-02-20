import random from 'random'
import { Zobrist } from '../zobrist'
import { expect, test } from 'vitest'

const cache1 = new Zobrist({ size: 15, randFn: () => random.int(0, 2 ** 30) })
const cache2 = new Zobrist({ size: 15, randFn: () => random.int(0, 2 ** 30) })
const cache1Code = cache1.code
const cache2Code = cache2.code

const loopCount = 10000
console.time('cache1')
for (let a = 0; a < loopCount; a++) {
  for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) cache1.go(i, j)
}
console.timeEnd('cache1')

console.time('cache2')
for (let a = 0; a < loopCount; a++) {
  for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) cache2.go(i, j)
}
console.timeEnd('cache2')

test('Zobrist 走子+回退之后, code 应该不变', () => {
  expect(cache1.code).toBe(cache1Code)
  expect(cache2.code).toBe(cache2Code)
})
