/**
 * 策略: 所有 max 可能的次数 - min 可能的次数
 */

import { max, min } from './const'
import { colToRow } from './support'

const sumMM = (arr) => {
  let rst = {}
  arr.forEach((m) => {
    rst[m] = rst[m] + 1 || 1
  })
  return rst
}
const score = (m) => {
  if (m[max] === 3) return Infinity
  else if (m[min] === 3) return -Infinity
  else if (m[max] && !m[min]) return 1
  else if (m[min] && !m[max]) return -1
  return 0
}
const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const evaluate = (state) => {
  let rst = 0
  // 遍历行
  rst += sum(state.map(sumMM).map(score))
  // 遍历列
  rst += sum(colToRow(state).map(sumMM).map(score))
  // 对角线
  rst += sum(
    [
      [state[0][0], state[1][1], state[2][2]],
      [state[2][0], state[1][1], state[0][2]],
    ]
      .map(sumMM)
      .map(score)
  )
  return rst
}

export { evaluate, colToRow }
