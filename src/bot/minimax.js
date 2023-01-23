import { blank, boardLength, boardCenter, max, min } from './const'
import { evaluate } from './evaluate.js'
import { arrayN } from './support'

export class Gobang {
  constructor({ boardLength }) {
    this.totalChessPieces = boardLength * boardLength
    this.node = arrayN(boardLength).map((_) => arrayN(boardLength, blank))
    this.stack = []
    this.maxWins = []
    this.minWins = []
  }

  put(position, maxOrMin) {
    this.node[position[0]][position[1]] = maxOrMin
    this.stack.push(position)
  }

  isEmptyPosition(i, j) {
    return i >= 0 && i < boardLength && j >= 0 && j < boardLength && this.node[i][j] === blank
  }

  getNearPositions(position) {
    const rst = []
    const seekStep = 2
    const [centerI, centerJ] = position
    for (let i = -seekStep; i < seekStep; i++)
      for (let j = -seekStep; j < seekStep; j++)
        if (this.isEmptyPosition(i + centerI, j + centerJ)) {
          rst.push([i + centerI, j + centerJ])
        }
    return rst
  }

  getAllOptimalNextStep() {
    const rst = []
    if (this.stack.length === 0) return [[boardCenter, boardCenter]]
    if (this.stack.length === 1) {
      if (this.isEmptyPosition(boardCenter, boardCenter)) return [[boardCenter, boardCenter]]
      const i = boardCenter + (Math.random() > 0.5 ? 1 : -1)
      const j = boardCenter + (Math.random() > 0.5 ? 1 : -1)
      return [[i, j]]
    }
    let hashMap = {}
    this.stack.forEach((m) => {
      const nearPositions = this.getNearPositions(m)
      nearPositions.forEach(([i, j]) => {
        if (!hashMap[i + '#' + j]) {
          hashMap[i + '#' + j] = true
          rst.push([i, j])
        }
      })
    })
    return rst
  }

  childs() {
    let rst = []
    for (let i in this.node) for (let j in this.node[i]) if (this.node[i][j] === blank) rst.push([i, j])
    return rst
  }

  rollback() {
    if (this.stack.length) {
      const position = this.stack.pop()
      this.node[position[0]][position[1]] = blank
    }
  }

  isTerminalNode = () => this.theWinner || this.isBoardFull

  minimax(depth, alpha = -Infinity, beta = Infinity, isMax = true) {
    // return evaluate(this.node)
    if (this.isTerminalNode() || depth === 0) {
      return [evaluate(this.node), null]
    }
    const allNextPosition = this.getAllOptimalNextStep()
    if (isMax) {
      let val = -Infinity
      let nextPosition = allNextPosition && allNextPosition[0] // 即使所有评分都等于 -Infinity (必输局), 也要随便走一步
      for (const childPosition of allNextPosition) {
        this.put(childPosition, max)
        const childVal = this.minimax(depth - 1, alpha, beta, !isMax)[0]
        this.rollback()
        if (childVal > val) {
          val = childVal
          nextPosition = childPosition
        }
        alpha = Math.max(alpha, val)
        if (beta <= alpha) break
      }
      return [val, nextPosition]
    } else {
      let val = Infinity
      let nextPosition = allNextPosition && allNextPosition[0]
      for (const childPosition of allNextPosition) {
        this.put(childPosition, min)
        const childVal = this.minimax(depth - 1, alpha, beta, !isMax)[0]
        this.rollback()
        if (childVal < val) {
          val = childVal
          nextPosition = childPosition
        }
        beta = Math.min(beta, val)
        if (beta <= alpha) break
      }
      return [val, nextPosition]
    }
  }

  get theWinner() {
    const score = evaluate(this.node)
    if (score === Infinity) return max
    if (score === -Infinity) return min
    return null

    if (!this.stack.length) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.node[lastI][lastJ]
    // 横
    let count = 0
    for (var j = lastJ - 4 > 0 ? lastJ - 4 : 0; j <= lastJ + 4; j++) {
      if (this.node[lastI][j] === mayBeWinner) count++
      else count = 0
      if (count === 5) return mayBeWinner
    }
    // 竖
    const case2 = [
      this.node[lastI - 4] && this.node[lastI - 4][lastJ],
      this.node[lastI - 3] && this.node[lastI - 3][lastJ],
      this.node[lastI - 2] && this.node[lastI - 2][lastJ],
      this.node[lastI - 1] && this.node[lastI - 1][lastJ],
      this.node[lastI][lastJ],
      this.node[lastI + 1] && this.node[lastI + 1][lastJ],
      this.node[lastI + 2] && this.node[lastI + 1][lastJ],
      this.node[lastI + 3] && this.node[lastI + 1][lastJ],
      this.node[lastI + 4] && this.node[lastI + 1][lastJ],
    ].join('')
    // 左斜
    // 右斜
    const matchStr = `${mayBeWinner}${mayBeWinner}${mayBeWinner}${mayBeWinner}${mayBeWinner}`
    if (RegExp(matchStr).test(case2)) return mayBeWinner
    return null
  }

  get isBoardFull() {
    return this.stack.length === this.totalChessPieces
  }
}
