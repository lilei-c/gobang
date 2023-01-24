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

    for (let i = this.stack.length - 1; i >= 0; i--) {
      const nearPositions = this.getNearPositions(this.stack[i])
      nearPositions.forEach(([i, j]) => {
        if (!hashMap[i + '#' + j]) {
          hashMap[i + '#' + j] = true
          rst.push([i, j])
        }
      })
    }
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

  isTerminalNode = () => this.theWinner() || this.isBoardFull

  minimax(depth, alpha = -Infinity, beta = Infinity, isMax = true) {
    if (this.isTerminalNode() || depth === 0) {
      return [evaluate(this.node, !isMax), null]
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

  getChessInFourDirection() {
    let rst = [[], [], [], []]
    if (!this.stack.length) return rst
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const minI = lastI - 4 > 0 ? lastI - 4 : 0
    const maxI = lastI + 4 < boardLength - 1 ? lastI + 4 : boardLength - 1
    const minJ = lastJ - 4 > 0 ? lastJ - 4 : 0
    const maxJ = lastJ + 4 < boardLength - 1 ? lastJ + 4 : boardLength - 1
    // 横
    for (let j = minJ; j <= maxJ; j++) {
      rst[0].push(this.node[lastI][j])
    }
    // 竖
    for (let i = minI; i <= maxI; i++) {
      rst[1].push(this.node[i][lastJ])
    }
    // 左斜
    rst[2].push(this.node[lastI][lastJ])
    for (let a = 1; a <= 4; a++) {
      if (lastI - a >= minI && lastJ + a <= maxJ) rst[2].push(this.node[lastI - a][lastJ + a])
      if (lastI + a <= maxI && lastJ - a >= minJ) rst[2].unshift(this.node[lastI + a][lastJ - a])
    }
    // 右斜
    rst[3].push(this.node[lastI][lastJ])
    for (let a = 1; a <= 4; a++) {
      if (lastI + a <= maxI && lastJ + a <= maxJ) rst[3].push(this.node[lastI + a][lastJ + a])
      if (lastI - a >= minI && lastJ - a >= minJ) rst[3].unshift(this.node[lastI - a][lastJ - a])
    }
    return rst
  }

  theWinner() {
    if (this.stack.length < 9) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.node[lastI][lastJ]
    const chessInFourDirection = this.getChessInFourDirection()
    let count = 0
    for (let i = 0; i < 4; i++) {
      const chesses = chessInFourDirection[i]
      for (let j = 0; j < chesses.length; j++) {
        if (chesses[j] === mayBeWinner) count++
        else count = 0
        if (count === 5) return mayBeWinner
      }
    }
    return null
  }

  get isBoardFull() {
    return this.stack.length === this.totalChessPieces
  }
}
