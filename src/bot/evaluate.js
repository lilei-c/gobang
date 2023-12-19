import { MAX, MIN, WALL, EMPTY } from './const'
import { chessModeBit, Score } from './genLineScore'
const { l1, d2, l2, d3, l3, d4, l4, l5 } = chessModeBit

export function evaluateOnlyLine(node, lineIndex, log) {
  let maxL5 = 0
  let maxL4 = 0
  let maxD4 = 0
  let maxL3 = 0
  let maxD3 = 0
  let maxL2 = 0
  let maxD2 = 0
  let maxL1 = 0
  //
  let minL5 = 0
  let minL4 = 0
  let minD4 = 0
  let minL3 = 0
  let minD3 = 0
  let minL2 = 0
  let minD2 = 0
  let minL1 = 0

  const readAndCountScore = (role, piece) => {
    // 至少是活1
    // log && console.log('piece', piece.toString(2))
    if (piece < 0b100010) return
    const pieceMode = this.serialPointMode[piece] // this. 要快一点
    // const pieceMode = serialPointMode[piece]
    // const pieceMode = serialPointModeObj[piece]

    if (!pieceMode) return
    // log && console.warn(pieceMode.toString(2))
    if (role === MAX) {
      switch (pieceMode) {
        case l1:
          return maxL1++
        case d2:
          return maxD2++
        case l2:
          return maxL2++
        case d3:
          return maxD3++
        case l3:
          return maxL3++
        case d4:
          return maxD4++
        case l4:
          return maxL4++
        case l5:
          return maxL5++
        default:
          return console.error('error')
      }
    } else {
      switch (pieceMode) {
        case l1:
          return minL1++
        case d2:
          return minD2++
        case l2:
          return minL2++
        case d3:
          return minD3++
        case l3:
          return minL3++
        case d4:
          return minD4++
        case l4:
          return minL4++
        case l5:
          return minL5++
        default:
          return console.error('error')
      }
    }
  }

  const check = (chess, block, line) => {
    // 其实有很多空行, 这些空行根本不需要计算
    if (line === 0) return

    let piece = 0b1
    let emptyCount = 0
    let isBreak = false

    // 评分是用的连续12子的评分, 这里一行有 15 个子, 能行么?
    // 大概率可行? , 一行超过连续 12子只有某一方棋子和单个空格, 这个概率很低
    // 010101010, 最多是这样连续12子, 两边不可能再加了, 因为 max 不可能下两边不下中间
    // 0101000101 只能是类似这种, 中间先空出来, 最后在中间落子, 这个概率很低吧?
    // 如果要非常严谨, 可以把超过12子的情况也加到 Score map 中去
    // console.log(line.toString(2))
    for (let i = 0; i < 15; i++) {
      const val = line & 0b11
      // log && console.log('val', val.toString(2))
      line >>= 2
      if (val === block || val === WALL) {
        // 截断, 读分
        readAndCountScore(chess, piece)
        piece = 0b1
        isBreak = true
        continue
      } else if (val === EMPTY) {
        if (emptyCount === 0) {
          emptyCount++
          piece <<= 1
        } else {
          // 出现两个空位, 截断, 计分
          piece <<= 1
          // 下一个还是空位
          if ((line & 0b1100) === EMPTY && i !== 14) piece <<= 1
          readAndCountScore(chess, piece)
          // 被空位截断的, 后续读子时要把空位算上
          piece = 0b100
          if ((line & 0b1100) === EMPTY && i !== 14) piece <<= 1
          // console.error(line & (0b11 << (2 * (i - 2))), { p: piece.toString(2) })
          emptyCount = 0
          isBreak = true
          continue
        }
      } else {
        emptyCount = 0
        isBreak = false
        piece = (piece << 1) + 1
        // console.warn({ p: piece.toString(2) })
      }
    }
    // 读分, 这里要判断结束时是否是被截断, 防止重复计分
    if (!isBreak) {
      readAndCountScore(chess, piece)
    }
  }

  // console.log(1, check(MIN, MAX, 0b10001010101000))
  // debugger
  // console.log(2, check(MIN, MAX, 0b1000101010100000000000))
  // debugger
  // console.log(3, check(MIN, MAX, 0b10001000100000000000))
  // debugger
  // return
  // max
  check(MAX, MIN, node[lineIndex])
  // min
  check(MIN, MAX, node[lineIndex])

  if (log) {
    console.log({ maxL1, maxD2, maxL2, maxD3, maxL3, maxD4, maxL4, maxL5 })
    console.log({ minL1, minD2, minL2, minD3, minL3, minD4, minL4, minL5 })
  }

  let maxScore = 0
  let minScore = 0

  // 这段逻辑能不能添加到 evaluate ?
  // // 搜索结束后, 下一个是谁下棋
  // const seekEndAndNextIsMax = (this.seekDepth & 0b1) === 0
  // if (seekEndAndNextIsMax) {
  //   if (maxL4) {
  //     // console.warn(structuredClone(this.stack), structuredClone(this.maxPointsScore))
  //     return Score.l5 * 2
  //   }
  //   if (maxD4) {
  //     // console.warn(structuredClone(this.stack))
  //     return Score.l5 * 3
  //   }

  //   if (minL4) return -Score.l5
  //   if (minD4 > 1 || minL3 > 1 || (minL3 && minD4)) return -Score.l5 * 3 // "冲四+活三"不严谨, 有可能被一颗子拦截
  //   if (maxL3) {
  //     if (!minL4 && !minD4) maxScore += Score.l4
  //     // if (maxL3 > 1) maxScore += Score.l3 * 2 // 额外奖励, 可调整
  //   }
  // } else {
  //   if (minL4 || minD4) return -Score.l5
  //   if (maxL4) return Score.l5
  //   if (maxD4 > 1 || maxL3 > 1 || (maxL3 && maxD4)) return -Score.l5 * 2 // "冲四+活三"不严谨, 有可能被一颗子拦截
  //   if (minL3) {
  //     if (!maxL4 && !maxD4) minScore += Score.l4
  //     // if (minL3 > 1) minScore += Score.l3 * 2 // 额外奖励, 可调整
  //   }
  // }
  // if (maxL2 > 2) maxScore += Score.l2 // 额外奖励, 可调整
  // if (minL2 > 2) minScore += Score.l2 // 额外奖励, 可调整
  maxScore =
    Score.l5 * maxL5 +
    Score.l4 * maxL4 +
    Score.d4 * maxD4 +
    Score.l3 * maxL3 +
    Score.d3 * maxD3 +
    Score.l2 * maxL2 +
    Score.d2 * maxD2 +
    Score.l1 * maxD2
  minScore =
    Score.l5 * minL5 +
    Score.l4 * minL4 +
    Score.d4 * minD4 +
    Score.l3 * minL3 +
    Score.d3 * minD3 +
    Score.l2 * minL2 +
    Score.d2 * minD2 +
    Score.l1 * minD2
  let score = maxScore - minScore
  return score
}

export function evaluate() {
  let score = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < this.scoreNode[i].length; j++) {
      const lineScore = this.scoreNode[i][j]
      if (lineScore) score += lineScore
    }
  }
  return score
}
