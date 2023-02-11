// 用 bits 记录棋型
// 0b00 00 00 00 000 000 000 000
//   l5 l4 d4 l3  d3  l2  d2  l1
const l1 = 2 ** 0 // 1
const d2 = 2 ** 3 // 1000
const l2 = 2 ** 6 // 1000000
const l2x2 = l2 * 2
const d3 = 2 ** 9 // 1000000000
const l3 = 2 ** 12 // 1000000000000
const d4 = 2 ** 14 // 100000000000000
const l4 = 2 ** 16 // 10000000000000000
const l5 = 2 ** 18 // 1000000000000000000
const chessModeBit = { l1, d2, l2, d3, l3, d4, l4, l5, l2x2 }

const getPointMode = (x) => {
  return {
    l1: x & 0b111,
    d2: (x & 0b111000) >> 3,
    l2: (x & 0b1111000000) >> 6,
    d3: (x & 0b1111000000000) >> 9,
    l3: (x & 0b11000000000000) >> 12,
    d4: (x & 0b1100000000000000) >> 14,
    l4: (x & 0b110000000000000000) >> 16,
    l5: (x & 0b11000000000000000000) >> 18,
  }
}

const Score = {
  /**/ l1: 10,
  /**/ d2: 10,
  /**/ d3: 100,
  /**/ l2: 150,
  /**/ l2x2: 300,
  /**/ l3: 200,
  /**/ d4: 1000,
  /**/ l4: 2000,
  /**/ l5: 10000,
  /**/ win: 100000,
}

console.warn('todo: 测试 countLine 是否正确')
//
const countLine = (chess, block, wall) => (s) => {
  let r = 0b1
  for (let i = 0; i < s.length; i++) {
    const val = s[i]
    if (i < 4) {
      r <<= 1
      if (val === chess) r += 1
      else if (val === block || val === wall) {
        r = 0b1
      }
    } else if (i === 4) {
      r <<= 1
      r += 1 //console.log(r.toString(2))
    } else {
      if (val === block || val === wall) break
      r <<= 1
      if (val === chess) r += 1 //console.log(r.toString(2))
    }
  }
  return r
}

const generateAllModes = (length) => {
  let rst = []
  let max = 2 ** (length + 1)
  while (max-- > 0) {
    rst.push('0b' + max.toString(2))
  }
  return rst
}

const allModes = generateAllModes(11)

const isLive1 = (x) => /010/.test(x) && x.length > 5
const isDead2 = (x) => /10{0,1}1/.test(x) && x.length >= 5
const isLive2 = (x) => [/000110/, /001100/, /011000/, /001010/, /010100/].some((t) => t.test(x))
const isLive2x2 = (x) => /0101010/.test(x)
const isDead3 = (x) => [/111/, /1011/, /1101/, /11001/, /10011/, /10101/].some((t) => t.test(x))
const isLive3 = (x) => [/010110/, /011010/, /01110/, /1010101/].some((t) => t.test(x))
const isDead4 = (x) => [/1111/, /11011/, /11101/, /10111/].some((t) => t.test(x))
const isLive4 = (x) => [/011110/, /1011101/, /11011011/, /111010111/].some((t) => t.test(x))
const is5 = (x) => /1{5}/.test(x)

const stat = {}
allModes.forEach((x) => (stat[x] = null))
// 映射 棋型count -> 棋型bit
const ninePointMode = []
// 这里从上到下的顺序很重要, 必须子多的在后, 子多的覆盖子少的
allModes.forEach((x) => isLive1(x.slice(3)) && (stat[x] = 'l1') && (ninePointMode[+x] = l1))
allModes.forEach((x) => isDead2(x.slice(3)) && (stat[x] = 'd2') && (ninePointMode[+x] = d2))
allModes.forEach((x) => isLive2(x.slice(3)) && (stat[x] = 'l2') && (ninePointMode[+x] = l2))
allModes.forEach((x) => isDead3(x.slice(3)) && (stat[x] = 'd3') && (ninePointMode[+x] = d3))
allModes.forEach((x) => isLive2x2(x.slice(3)) && (stat[x] = 'l2x2') && (ninePointMode[+x] = l2x2))
allModes.forEach((x) => isLive3(x.slice(3)) && (stat[x] = 'l3') && (ninePointMode[+x] = l3))
allModes.forEach((x) => isDead4(x.slice(3)) && (stat[x] = 'd4') && (ninePointMode[+x] = d4))
allModes.forEach((x) => isLive4(x.slice(3)) && (stat[x] = 'l4') && (ninePointMode[+x] = l4))
allModes.forEach((x) => is5(x.slice(3)) && (stat[x] = 'l5') && (ninePointMode[+x] = l5))

console.log(
  '未构成棋型的组合, 这一部分已经验证',
  Object.keys(stat)
    .filter((x) => !stat[x])
    .map((x) => x.slice(3))
)
console.warn('todo: 验证以下棋型是否正确')
Object.keys(Score).forEach((m) => {
  console.log(
    m,
    Object.keys(stat)
      .filter((x) => stat[x] === m)
      .map((x) => x.slice(3))
  )
})

console.log({ allModes, ninePointMode })

export { ninePointMode, Score, countLine, getPointMode, chessModeBit }
