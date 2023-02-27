import { expect, test } from 'vitest'
import { Score } from '../genLineScore'
import { Gobang } from '../gobang'
import kills from './stacks/kill'

test.each(kills)('应该算杀成功/失败', (kill) => {
  const gobang = new Gobang({ firstHand: kill.firstHand })
  // vitest 里, 搜索速度比浏览器慢 5 倍左右, 所以时间给多一点
  gobang.timeLimit = 20000
  gobang.restoreStack(kill.stack)
  const score = gobang.seekKill()
  if (kill.isKill) expect(score.score >= Score.win).toBe(kill.isKill)
  else expect(score).toBe(undefined)
})
