const EMPTY = 0
const MAX = 1
const MIN = 2
const boardLength = 15
const timeLimit = 10000

export class GobangMCTS {
  constructor({ firstHand, notInitSteps }) {
    this.node0 = Array(boardLength)
      .fill()
      .map((_) => Array(boardLength).fill(EMPTY))
    this.stack = []
    this.firstHand = firstHand || MIN

    if (!notInitSteps)
      this.steps = Array(boardLength ** 2)
        .fill()
        .map((_, i) => i)

    this.resetCount()
  }

  resetCount() {
    this.win = 0
    this.loss = 0
    this.count = 0
    this.mctsCount = 0
    this.mctsNodeCount = 0
  }

  maxGo() {
    if (this.isFinal) return
    const position = this.mtcs()
    const { i, j } = position
    this.put(i, j, MAX)
    return position
  }

  mtcs() {
    console.error(this.mctsCount, this.mctsNodeCount)
    this.resetCount()
    const startTime = +new Date()
    const allLegalPoints = this.getAllLegalNextStep()
    // 生成子节点
    let childs = allLegalPoints.map((x) => {
      let child = new GobangMCTS({ firstHand: this.firstHand, notInitSteps: true })
      // child.restoreStack([...this.stack, x])
      child.steps = p.steps.filter((m) => m !== x)
      child.restoreStack([...this.stack, [(x / boardLength) >> 0, x % boardLength]])
      child.parent = this
      return child
    })
    // console.warn({ childs })
    while (+new Date() - startTime < timeLimit) {
      //随机位置
      const p = Math.floor(Math.random() * childs.length)
      this.mtcs2(childs[p])
    }
    childs.sort((a, b) => {
      return b.count - a.count
    })
    const selectChild = childs[0]
    const [i, j] = selectChild.stack[selectChild.stack.length - 1]
    return { i, j }
  }

  mtcs2(p) {
    // 生成子节点
    if (!p.childs) {
      const allLegalPoints = p.getAllLegalNextStep()
      let childs = allLegalPoints.map((x) => {
        let child = new GobangMCTS({ firstHand: this.firstHand, notInitSteps: true })
        child.steps = p.steps.filter((m) => m !== x)
        child.restoreStack([...p.stack, [(x / boardLength) >> 0, x % boardLength]])
        child.parent = p
        this.mctsNodeCount++
        return child
      })
      p.childs = childs
    }

    // 选择一个子节点
    const rand = Math.floor(Math.random() * p.childs.length)
    const child = p.childs[rand]
    // 如果是终局, 更新统计信息
    const winner = child.winner
    if (winner) {
      child.updateScore(winner === MAX, winner !== MAX)
      this.mctsCount++
    } else if (child.isBoardFull) {
      child.updateScore(false, false)
      this.mctsCount++
    } else this.mtcs2(child)
  }

  updateScore(win, loss) {
    if (!this.parent) return
    this.parent.updateScore(win, loss)
    if (win) this.win += 1
    else if (loss) this.loss += 1
    this.count += 1
    //
    const C = 2
    this.Q = this.win / this.count
    this.U = (C * Math.sqrt(this.parent.count)) / (1 + this.count)
    this.ucb_value = this.Q + this.U
  }

  getAllLegalNextStep() {
    return this.steps
  }

  minGo(i, j) {
    if (this.isFinal) return
    this.put(i, j, MIN)
  }

  put(i, j, role) {
    this.stack.push([i, j])
    this.node0[i][j] = role
    this.steps = this.steps.filter((x) => x !== i * boardLength + j)
  }

  restoreStack(stack) {
    const first = this.firstHand
    const second = first === MAX ? MIN : MAX
    for (let a = 0; a < stack.length; a++) {
      const [i, j] = stack[a]
      const currentPlayer = a % 2 === 0 ? first : second
      this.put(i, j, currentPlayer)
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
