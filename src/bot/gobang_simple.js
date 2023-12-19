const EMPTY = 0
const MAX = 1
const MIN = 2
const boardLength = 15
const arrayN = (n, val) =>
  Array(n)
    .fill()
    .map(() => structuredClone(val))
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
const Score = {
  l1: 1,
  d2: 2,
  l2: 8,
  d3: 12,
  l3: 30,
  d4: 50,
  l4: 500,
  l5: 10000,
}

export class GobangSimple {
  constructor({ firstHand }) {
    this.node0 = Array(boardLength)
      .fill()
      .map((_) => Array(boardLength).fill(EMPTY))
    this.neighborNode = Array(boardLength)
      .fill()
      .map((_) => Array(boardLength).fill(EMPTY))
    this.stack = []
    this.firstHand = firstHand || MIN
    this.pointsScore = arrayN(boardLength, arrayN(boardLength, [0, 0, 0, 0]))
  }

  maxGo() {
    if (this.isFinal) return
    const pointsScore = []
    this.pointsScore.forEach((x) => x.forEach((m) => pointsScore.push(m[0] + m[1] + m[2] + m[3])))
    const maxScore = Math.max(...pointsScore)
    const maxScoreIndex = pointsScore.indexOf(maxScore)
    const i = (maxScoreIndex / boardLength) >> 0
    const j = maxScoreIndex % boardLength
    console.log({ x: this.pointsScore, pointsScore, maxScore, maxScoreIndex, i, j })
    this.put(i, j, MAX)
    return { i, j }
  }

  minGo(i, j) {
    if (this.isFinal) return
    this.put(i, j, MIN)
  }

  updatePointScore(i, j) {
    for (let direction = 0; direction < 4; direction++) {
      const positions = this.getPositionsInFourDirection(i, j, direction)
      for (let index = 0; index < positions.length; index++) {
        const [i, j] = positions[index]
        if (this.node0[i][j] !== EMPTY) {
          this.pointsScore[i][j] = [0, 0, 0, 0]
        } else {
          // 一个方向上的点, 只需更新对应方向的分数
          const maxChessInOneDirection = this.getChessInFourDirection(i, j, direction, MAX)
          const minChessInOneDirection = this.getChessInFourDirection(i, j, direction, MIN)
          const maxStr = maxChessInOneDirection.join('')
          const minStr = minChessInOneDirection.join('').replace(/1/g, '3').replace(/2/g, '1')
          let maxScore = 0
          const types = ['l5', 'l4', 'd4', 'l3', 'd3', 'l2', 'd2', 'l1']
          for (const x of types) {
            if (tests[x](maxStr)) {
              maxScore = Score[x]
              break
            }
          }
          let minScore = 0
          for (const x of types) {
            if (tests[x](minStr)) {
              minScore = Score[x]
              break
            }
          }
          this.pointsScore[i][j][direction] = maxScore + minScore + (1 - Math.hypot(i - 7.5, j - 7.5) / 1000)
        }
      }
    }
  }

  getPositionsInFourDirection(centerI, centerJ, direction) {
    const minI = centerI - 4 > 0 ? centerI - 4 : 0
    const maxI = centerI + 4 < boardLength - 1 ? centerI + 4 : boardLength - 1
    const minJ = centerJ - 4 > 0 ? centerJ - 4 : 0
    const maxJ = centerJ + 4 < boardLength - 1 ? centerJ + 4 : boardLength - 1
    if (direction === 0) {
      let rst = []
      for (let j = minJ; j <= maxJ; j++) rst.push([centerI, j])
      return rst
    }
    if (direction === 1) {
      let rst = []
      for (let i = minI; i <= maxI; i++) rst.push([i, centerJ])
      return rst
    }
    if (direction === 2) {
      let rst = []
      for (let a = 4; a > 0; a--) {
        if (centerI - a >= minI && centerJ + a <= maxJ) rst.push([centerI - a, centerJ + a])
      }
      rst.push([centerI, centerJ])
      for (let a = 1; a <= 4; a++) {
        if (centerI + a <= maxI && centerJ - a >= minJ) rst.push([centerI + a, centerJ - a])
      }
      return rst
    }
    if (direction === 3) {
      let rst = []
      for (let a = 4; a > 0; a--) {
        if (centerI - a >= minI && centerJ - a >= minJ) rst.push([centerI - a, centerJ - a])
      }
      rst.push([centerI, centerJ])
      for (let a = 1; a <= 4; a++) {
        if (centerI + a <= maxI && centerJ + a <= maxJ) rst.push([centerI + a, centerJ + a])
      }
      return rst
    }
  }

  put(i, j, role) {
    this.stack.push([i, j])
    this.node0[i][j] = role
    this.updatePointScore(i, j)
    this.updateNeighbor(i, j, true)
  }

  updateNeighbor(centerI, centerJ, isFall) {
    if (isFall) this.neighborNode[centerI][centerJ] -= 64
    else this.neighborNode[centerI][centerJ] += 64
    const seekStep = 2
    for (let i = -seekStep; i <= seekStep; i++) {
      if (i + centerI < 0 || i + centerI >= boardLength) continue
      for (let j = -seekStep; j <= seekStep; j++) {
        if (j + centerJ < 0 || j + centerJ >= boardLength || (i === 0 && j === 0)) continue
        if (isFall) this.neighborNode[i + centerI][centerJ + j] += 1
        else this.neighborNode[i + centerI][centerJ + j] -= 1
      }
    }
  }

  getChessInFourDirection(centerI, centerJ, direction, role) {
    return this.getPositionsInFourDirection(centerI, centerJ, direction).map((x) => {
      const [i, j] = x
      if (centerI === i && centerJ === j) return role
      return this.node0[i][j]
    })
  }

  get winner() {
    if (this.stack.length < 7) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.node0[lastI][lastJ]
    for (let i = 0; i < 4; i++) {
      let count = 0
      const chesses = this.getPositionsInFourDirection(lastI, lastJ, i).map((x) => this.node0[x[0]][x[1]])
      for (let j = 0; j < chesses.length; j++) {
        if (chesses[j] === mayBeWinner) count++
        else count = 0
        if (count === 5) return mayBeWinner
      }
    }
    return null
  }

  get isFinal() {
    return this.winner || this.isBoardFull
  }

  get isBoardFull() {
    return this.stack.length === boardLength ** 2
  }
}
