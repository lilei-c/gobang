import { blank, boardLength, boardCenter, max, min } from './const'
import { evaluate } from './evaluate.js'
import { countLine, countLineSocre, Socre } from './genLineSocre'
import { arrayN } from './support'
import { Zobrist } from './zobrist'
console.log({ countLineSocre })

export class Gobang {
  constructor({ boardLength }) {
    this.totalChessPieces = boardLength * boardLength
    this.node = arrayN(boardLength).map((_) => arrayN(boardLength, blank))
    this.stack = []
    this.zobrist = new Zobrist({ size: boardLength })
    this.maxPointsSocre = arrayN(boardLength).map((_) => arrayN(boardLength, 0))
    this.minPointsSocre = arrayN(boardLength).map((_) => arrayN(boardLength, 0))
  }
  static max = max
  static min = min
  static blank = blank
  static genLimit = 20 // 启发式搜索, 选取节点数
  static defaultDepth = 5

  put(position, maxOrMin) {
    const [i, j] = position
    this.node[i][j] = maxOrMin
    this.zobrist.go(i, j, maxOrMin === max)
    this.stack.push(position)
    this.updateXLineSocre(i, j)
  }

  rollback() {
    if (this.stack.length) {
      const [i, j] = this.stack.pop()
      this.zobrist.go(i, j, this.node[i][j] === max)
      this.node[i][j] = blank
      this.updateXLineSocre(i, j)
    }
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
    // return rst.slice(0, 10)
    return rst
  }

  isTerminalNode = () => this.theWinner() || this.isBoardFull

  minimax(depth, alpha = -Infinity, beta = Infinity, isMax = true) {
    if (this.isTerminalNode() || depth === 0) {
      let socre = this.zobrist.get()
      if (socre === undefined) {
        socre = evaluate(this.node, !isMax)
        this.ABData.eva++
        // this.zobrist.set(socre)
        // console.log('miss', depth, { socre })
      } else {
        // console.log('hit', depth, structuredClone(this.stack[this.stack.length - 1]), { socre })
      }
      return [socre, null]
    }
    let allNextPosition = this.getAllOptimalNextStep()
    const orderedPoints = this.orderPoints(allNextPosition, isMax ? Gobang.max : Gobang.min)
    allNextPosition = orderedPoints
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
        // console.log('alpha', 6 - depth, alpha, Math.max(alpha, val), beta)
        alpha = Math.max(alpha, val)
        if (beta <= alpha) {
          this.ABData.cut++
          // console.log('alpha cut')
          break
        }
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
        // console.log('beta', 6 - depth, alpha, beta)
        if (beta <= alpha) {
          this.ABData.cut++
          break
        }
      }
      return [val, nextPosition]
    }
  }

  getChessInFourDirection(centerI, centerJ) {
    let rst = [[], [], [], []]
    const minI = centerI - 4 > 0 ? centerI - 4 : 0
    const maxI = centerI + 4 < boardLength - 1 ? centerI + 4 : boardLength - 1
    const minJ = centerJ - 4 > 0 ? centerJ - 4 : 0
    const maxJ = centerJ + 4 < boardLength - 1 ? centerJ + 4 : boardLength - 1
    // 横
    for (let j = minJ; j <= maxJ; j++) {
      rst[0].push(this.node[centerI][j])
    }
    // 竖
    for (let i = minI; i <= maxI; i++) {
      rst[1].push(this.node[i][centerJ])
    }
    // 左斜
    rst[2].push(this.node[centerI][centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI - a >= minI && centerJ + a <= maxJ) rst[2].push(this.node[centerI - a][centerJ + a])
      if (centerI + a <= maxI && centerJ - a >= minJ) rst[2].unshift(this.node[centerI + a][centerJ - a])
    }
    // 右斜
    rst[3].push(this.node[centerI][centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI + a <= maxI && centerJ + a <= maxJ) rst[3].push(this.node[centerI + a][centerJ + a])
      if (centerI - a >= minI && centerJ - a >= minJ) rst[3].unshift(this.node[centerI - a][centerJ - a])
    }
    return rst
  }

  //
  getPositionInFourDirection(i, j) {
    let rst = []
    if (!this.stack.length) return rst
    const minI = i - 4 > 0 ? i - 4 : 0
    const maxI = i + 4 < boardLength - 1 ? i + 4 : boardLength - 1
    const minJ = j - 4 > 0 ? j - 4 : 0
    const maxJ = j + 4 < boardLength - 1 ? j + 4 : boardLength - 1
    // 横
    for (let j = minJ; j <= maxJ; j++) {
      rst.push([i, j])
    }
    // 竖
    for (let i = minI; i <= maxI; i++) {
      rst.push([i, j])
    }
    // 左斜
    for (let a = 1; a <= 4; a++) {
      if (i - a >= minI && j + a <= maxJ) rst.push([i - a, j + a])
      if (i + a <= maxI && j - a >= minJ) rst.push([i + a, j - a])
    }
    // 右斜
    for (let a = 1; a <= 4; a++) {
      if (i + a <= maxI && j + a <= maxJ) {
        rst.push([i + a, j + a])
      }
      if (i - a >= minI && j - a >= minJ) {
        rst.push([i - a, j - a])
      }
    }
    return rst
  }

  theWinner() {
    if (this.stack.length < 9) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.node[lastI][lastJ]
    const chessInFourDirection = this.getChessInFourDirection(lastI, lastJ)
    for (let i = 0; i < 4; i++) {
      let count = 0
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

  //
  updateXLineSocre(i, j) {
    // i,j 米字线上的点都需要更新
    const fourLinePoints = this.getPositionInFourDirection(i, j)
    // console.log(fourLinePoints)
    fourLinePoints && fourLinePoints.forEach(this.updatePointSocre.bind(this))
  }

  //
  updatePointSocre(position) {
    const [i, j] = position
    if (this.node[i][j] !== Gobang.blank) return
    // console.log(this.maxPointsSocre)
    // console.log(position, this.maxPointsSocre)
    this.maxPointsSocre[i][j] = this.evaPoint(i, j, Gobang.max)
    this.minPointsSocre[i][j] = this.evaPoint(i, j, Gobang.min)
  }

  /**
   * 启发式搜索
   * 假如在此处落子后, 米字线上能得到的分数, 即为该点的分数
   */
  evaPoint(i, j, role) {
    const chessInFourDirection = this.getChessInFourDirection(i, j)
    const chess = role === Gobang.max ? Gobang.max : Gobang.min
    const block = role === Gobang.max ? Gobang.min : Gobang.max
    const countFn = countLine(chess, block)
    let rst = 0
    chessInFourDirection.forEach((m) => {
      const count = countFn(m)
      // console.log(count, m)
      const socre = countLineSocre[count]
      window.aa = window.aa ? window.aa + 1 : 1
      rst += socre || 0
    })
    // console.log(rst)
    return rst
  }

  // 根据角色, 优先返回能获胜的点, 己方不能获胜时防止对方获胜
  orderPoints(points, role) {
    let max5 = []
    let min5 = []
    let max4 = []
    let min4 = []
    let max3 = []
    let min3 = []
    let maxMore2 = []
    let minMore2 = []
    let max2 = []
    let min2 = []
    let maxOtherNoMatter = []
    let minOtherNoMatter = []

    points.forEach((point) => {
      const [i, j] = point
      const maxSocre = this.maxPointsSocre[i][j]
      const minSocre = this.minPointsSocre[i][j]
      if (maxSocre >= Socre.live5) max5.push(point)
      else if (maxSocre >= Socre.live4) max4.push(point)
      else if (maxSocre >= 2 * Socre.live3) max4.push(point)
      else if (maxSocre >= Socre.live3) max3.push(point)
      else if (maxSocre >= 2 * Socre.live2) maxMore2.push(point)
      else if (maxSocre >= Socre.live2) max2.push(point)
      else maxOtherNoMatter.push(point)

      if (minSocre >= Socre.live5) min5.push(point)
      else if (minSocre >= Socre.live4) min4.push(point)
      else if (minSocre >= 2 * Socre.live3) min4.push(point)
      else if (minSocre >= Socre.live3) min3.push(point)
      else if (minSocre >= 2 * Socre.live2) minMore2.push(point)
      else if (minSocre >= Socre.live2) min2.push(point)
      else minOtherNoMatter.push(point)
    })

    let rst = []
    if (role === Gobang.max) {
      // console.log({ max5, min5, max4, min4 })
      if (max5.length) return max5
      if (min5.length) return min5
      if (max4.length) return max4
      if (min4.length) return min4
      rst = rst
        .concat(max3)
        .concat(min3)
        .concat(maxMore2)
        .concat(minMore2)
        .concat(max2)
        .concat(min2)
        .concat(maxOtherNoMatter)
    } else {
      if (min5.length) return min5
      if (max5.length) return max5
      if (min4.length) return min4
      if (max4.length) return max4
      rst = rst
        .concat(min3)
        .concat(max3)
        .concat(minMore2)
        .concat(maxMore2)
        .concat(min2)
        .concat(max2)
        .concat(minOtherNoMatter)
    }
    return rst.length <= Gobang.genLimit ? rst : rst.slice(0, Gobang.genLimit)
  }

  // 统计AB剪枝效率
  initABData() {
    this.ABData = {
      all: Math.pow(Gobang.genLimit, Gobang.defaultDepth),
      eva: 0,
      cut: 0,
    }
  }
  logABData() {
    const { all, eva, cut } = this.ABData
    const realCut = all - eva
    console.log(`节点数:${all} 评估:${eva} 减去:${cut}/${realCut}`)
  }
}
