import { expect, test } from 'vitest'
import { evaluate } from '../evaluate'
import { Gobang } from '../gobang'
import { stack } from './stacks/evaluate'

const gobang = new Gobang()

gobang.restoreStack(stack)
const score1 = evaluate.call(gobang)

gobang.firstHand = gobang.firstHand === Gobang.MAX ? Gobang.MIN : Gobang.MAX
gobang.restoreStack(stack)
const score2 = evaluate.call(gobang)

test('黑白交换后评分是否相反', () => {
  expect(score1).toBe(-score2)
})
