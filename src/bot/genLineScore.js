// 用 bits 记录棋型
// 0b00 00 00 00 000 000 000 000
//   l5 l4 d4 l3  d3  l2  d2  l1
export const chessModeBit = {
  l1: 2 ** 0, //  1
  d2: 2 ** 3, //  1000
  l2: 2 ** 6, //  1000000
  d3: 2 ** 9, //  1000000000
  l3: 2 ** 12, // 1000000000000
  d4: 2 ** 14, // 100000000000000
  l4: 2 ** 16, // 10000000000000000
  l5: 2 ** 18, // 1000000000000000000
}

export const getPointMode = (x) => ({
  l1: x & 0x7, // 0b111
  d2: (x >> 3) & 0x7,
  l2: (x >> 6) & 0x7,
  d3: (x >> 9) & 0x7,
  l3: (x >> 12) & 0x3, // 0b11
  d4: (x >> 14) & 0x3,
  l4: (x >> 16) & 0x3,
  l5: (x >> 18) & 0x3,
})

console.log('getPointMode')

export const Score = {
  /**/ l1: 1,
  /**/ d2: 2,
  /**/ l2: 8,
  /**/ d3: 12,
  /**/ l3: 30,
  /**/ d4: 50,
  /**/ l4: 500,
  /**/ l5: 1000,
  /**/ win: 10000,
}

console.log('getPoinScoretMode')

/**
 * 计算评估点分数
 * @param {Object} pointMode 评估点棋型数量统计
 * @returns {number} 评估点的总分数
 */
export const calcEvaPointScore = (pointMode) => {
  const { l5, l4, d4, l3, d3, l2, d2, l1 } = pointMode
  let rst = 0
  if (l5) rst += Score.l5 * l5
  if (l4) rst += Score.l4 * l4
  if (d4) rst += Score.d4 * d4
  if (l3) rst += Score.l3 * l3
  if (d3) rst += Score.d3 * d3
  if (l2) rst += Score.l2 * l2
  if (d2) rst += Score.d2 * d2
  if (l1) rst += Score.l1 * l1
  return rst
}

console.log('calcEvaPointScore')

console.warn('todo: 测试 countLine 是否正确')

export const countLine = (chess, block, wall) => (s) => {
  let r = 0b1 // 这里使用 0b1 而不是 1, 是为了明示棋子是用位表达的
  for (let i = 0; i < 4; i++) {
    const val = s[i]
    r <<= 1
    if (val === chess) r |= 1
    else if (val === block || val === wall) r = 0b1
  }
  // 第四位固定是棋子
  r = (r << 1) | 1
  for (let i = 5; i < 9; i++) {
    const val = s[i]
    if (val === block || val === wall) break
    r <<= 1
    if (val === chess) r |= 1
  }
  return r
}

console.log('countLine')

const generateAllModes = (len) => Array.from({ length: 1 << (len + 1) }, (_, i) => `0b${i.toString(2)}`)

const allModes = generateAllModes(12)
console.log(allModes.length)

const stat = {}
allModes.forEach((x) => (stat[x] = null))
// 映射 棋型count -> 棋型bit
const serialPointMode = []
const serialPointModeObj = {} // for performance test
// 这里从上到下的顺序很重要, 必须子多的在后, 子多的覆盖子少的
const tests = {
  l1: (x) => /010/.test(x) && x.length > 5,
  d2: (x) => /10{0,1}1/.test(x) && x.length >= 5,
  l2: (x) => [/000110/, /001100/, /011000/, /001010/, /010100/].some((t) => t.test(x)),
  d3: (x) => [/111/, /1011/, /1101/, /11001/, /10011/, /10101/].some((t) => t.test(x)) && x.length >= 5,
  l3: (x) => [/010110/, /011010/, /01110/, /1010101/].some((t) => t.test(x)),
  d4: (x) => [/11110/, /01111/, /11011/, /11101/, /10111/].some((t) => t.test(x)),
  l4: (x) => [/011110/, /1011101/, /11011011/, /111010111/].some((t) => t.test(x)),
  l5: (x) => /1{5}/.test(x),
}
for (const [key, test] of Object.entries(tests)) {
  allModes.forEach((x) => {
    if (test(x.slice(3))) {
      stat[x] = key
      serialPointMode[+x] = chessModeBit[key]
      serialPointModeObj[+x] = chessModeBit[key]
    }
  })
}

console.log('allModes.forEach')

// console.log(
//   '未构成棋型的组合, 这一部分已经验证',
//   Object.keys(stat)
//     .filter((x) => !stat[x])
//     .map((x) => x.slice(3))
// )
// console.warn('todo: 验证以下棋型是否正确')
// Object.keys(Score).forEach((m) => {
//   console.log(
//     m,
//     Object.keys(stat)
//       .filter((x) => stat[x] === m)
//       .map((x) => x.slice(3))
//   )
// })

// console.log({ allModes, serialPointMode, serialPointModeObj })
export { serialPointMode, serialPointModeObj }
