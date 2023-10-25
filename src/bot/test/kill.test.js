import { expect, test } from 'vitest'
import { Score } from '../genLineScore'
import { Gobang } from '../gobang'
import kills from './stacks/kill'

const gobang = new Gobang()
gobang.timeLimit = 10000 // vitest 里, 搜索速度比浏览器慢 5 倍左右, 所以时间给多一点

const winSocre = Score.l5 * 0.5 // 实际分数可能小于 L5, 但一定大于 0.5 倍 L5

Object.entries(kills).forEach((x) => {
  const title = x[0]
  const kill = x[1]
  test(`${title}应该算杀${kill.isKill ? '成功' : '失败'}`, () => {
    gobang.firstHand = kill.firstHand
    gobang.restoreStack(kill.stack)
    const score = gobang.seekKill()
    expect(score?.score > winSocre).toEqual(kill.isKill)
  })
})
