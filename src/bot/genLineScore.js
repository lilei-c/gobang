// 用 bits 记录空位棋型
// 0b00 00 00 00 0000 0000 0000
//   l5 l4 d4 l3   d3   l2   d2
const d2 = 2 ** 0
const l2 = 2 ** 4
const d3 = 2 ** 8
const l3 = 2 ** 12
const d4 = 2 ** 14
const l4 = 2 ** 16
const l5 = 2 ** 18

const getPointMode = (x) => {
  return {
    d2: x & 0b1111,
    l2: (x & 0b11110000) >> 4,
    d3: (x & 0b111100000000) >> 8,
    l3: (x & 0b11000000000000) >> 12,
    d4: (x & 0b1100000000000000) >> 14,
    l4: (x & 0b110000000000000000) >> 16,
    l5: (x & 0b11000000000000000000) >> 18,
  }
}

// 这个分数是指, `假如`在某个位置落子后, 该位置能获得的分数
const Score = {
  /**/ d2: 1,
  /**/ d3: 5,
  /**/ d4: 200,
  /**/ l2: 10,
  /**/ l3: 120,
  /**/ l4: 1000,
  /**/ l5: 10000,
  /**/ win: 100000,
}

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

const generateAllModes = (arr = [[]], deep = 6) => {
  if (deep === 0) return arr
  let temp = []
  for (const last of arr) for (const item of [0, 1, 2]) temp.push([...last, item])
  return generateAllModes(temp, deep - 1)
}

const allModes = generateAllModes([[]], 9)
  .filter((x) => x[4] == 1)
  .map(countLine(1, 2))
  .filter((x) => x.toString(2).match(/1/g)?.length > 2)
  .filter((x) => x.toString(2).length > 5)
  .sort()
  .map((x) => x.toString(2))

const obj = {}
allModes.forEach((x) => (obj[x] = null))
const isDead2 = (x) => /10{0,1}1/.test(x)
const isDead3 = (x) => [/111/, /1011/, /1101/, /11001/, /10011/, /10101/].some((t) => t.test(x))
const isDead4 = (x) => [/1111/, /11011/, /11101/, /10111/].some((t) => t.test(x))
const isLive2 = (x) => /^0+10{0,1}10+$/.test(x) && x.length > 5
const isLive3 = (x) => [/010110/, /011010/, /01110/, /1010101/].some((t) => t.test(x))
const isLive4 = (x) => [/011110/, /1011101/, /11011011/, /111010111/].some((t) => t.test(x))
const is5 = (x) => /1{5}/.test(x)

// 映射 棋型count -> 棋型bit
const countLineScore = []
allModes.forEach((x) => isDead2(x.slice(1)) && (obj[x] = Score.d2) && (countLineScore[+`0b${x}`] = d2))
allModes.forEach((x) => isDead3(x.slice(1)) && (obj[x] = Score.d3) && (countLineScore[+`0b${x}`] = d3))
allModes.forEach((x) => isDead4(x.slice(1)) && (obj[x] = Score.d4) && (countLineScore[+`0b${x}`] = d4))
allModes.forEach((x) => isLive2(x.slice(1)) && (obj[x] = Score.l2) && (countLineScore[+`0b${x}`] = l2))
allModes.forEach((x) => isLive3(x.slice(1)) && (obj[x] = Score.l3) && (countLineScore[+`0b${x}`] = l3))
allModes.forEach((x) => isLive4(x.slice(1)) && (obj[x] = Score.l4) && (countLineScore[+`0b${x}`] = l4))
allModes.forEach((x) => is5(x.slice(1)) && (obj[x] = Score.l5) && (countLineScore[+`0b${x}`] = l5))

console.log(
  '未构成棋型的组合, 这一部分已经验证',
  Object.keys(obj)
    .filter((x) => !obj[x])
    .map((x) => x.slice(1))
)
console.warn('todo: 验证以下棋型是否正确')
Object.keys(Score).forEach((m) => {
  console.log(
    m,
    Object.keys(obj)
      .filter((x) => obj[x] === Score[m])
      .map((x) => x.slice(1))
  )
})

console.log({ countLineScore })

export { countLineScore, Score, countLine, getPointMode }
