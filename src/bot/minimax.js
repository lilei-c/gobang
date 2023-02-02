import { empty, boardLength, boardCenter, max, min } from './const'
import { evaluate } from './evaluate.js'
import { countLine, countLineSocre, Socre } from './genLineSocre'
import { arrayN } from './support'
import { Zobrist } from './zobrist'

export class Gobang {
  constructor({ boardLength }) {
    this.totalChessPieces = boardLength * boardLength
    this.node = arrayN(boardLength).map((_) => arrayN(boardLength, Gobang.empty))
    this.stack = []
    this.zobrist = new Zobrist({ size: boardLength })
    this.maxPointsSocre = arrayN(boardLength).map((_) => arrayN(boardLength, null))
    this.minPointsSocre = arrayN(boardLength).map((_) => arrayN(boardLength, null))
    this.stats = {} // 统计性能优化数据
    this.enableStats = true // 记录 stats
    this.enableLog = false
    this.firstHand = Gobang.min
  }
  static max = max
  static min = min
  static empty = empty
  static wall = 3
  //
  static genLimit = 30 // 启发式搜索, 选取节点数
  static defaultDepth = 4

  put(position, role) {
    const [i, j] = position
    this.node[i][j] = role
    this.zobrist.go(i, j, role === Gobang.max)
    this.stack.push(position)
    this.updateXLineSocre(i, j)
  }

  rollback(steps = 1) {
    if (this.stack.length <= steps) return
    while (steps-- > 0) {
      const [i, j] = this.stack.pop()
      this.zobrist.go(i, j, this.node[i][j] === max)
      this.node[i][j] = Gobang.empty
      this.updateXLineSocre(i, j)
    }
  }

  maxGo() {
    console.time('thinking')
    this.zobrist.resetHash()
    this.initStats()
    const score = this.minimax(Gobang.defaultDepth)
    console.log({ score })
    this.put(score[1], Gobang.max)
    this.logStats()
    console.timeEnd('thinking')
    return score
  }

  minGo(i, j) {
    // if (isGameOver) return console.log({ isGameOver })
    // if (isBotStep) return console.log({ isBotStep })
    if (!this.isEmptyPosition(i, j)) return false
    this.put([i, j], Gobang.min)
    return true
  }

  minRepent() {
    if (this.stack.length >= 2) this.rollback(2)
  }

  isEmptyPosition(i, j) {
    return i >= 0 && i < boardLength && j >= 0 && j < boardLength && this.node[i][j] === Gobang.empty
  }

  getNearPositions(position) {
    const rst = []
    const seekStep = 2
    const [centerI, centerJ] = position
    for (let i = -seekStep; i <= seekStep; i++)
      for (let j = -seekStep; j <= seekStep; j++)
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
      this.enableStats && this.stats.abCut.eva++
      let socre = this.zobrist.get()
      if (socre === undefined) {
        socre = evaluate(this.node, !isMax)
        this.zobrist.set(socre)
        this.enableStats && this.stats.zobrist.miss++
      } else {
        this.enableStats && this.stats.zobrist.hit++
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
        alpha = Math.max(alpha, val)
        if (beta <= alpha) {
          this.enableStats && this.stats.abCut.cut++
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
        if (beta <= alpha) {
          this.enableStats && this.stats.abCut.cut++
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
    for (let a = -4; a <= 4; a++) {
      if (centerJ + a >= minJ && centerJ + a <= maxJ) rst[0].push(this.node[centerI][centerJ + a])
      else rst[0].push(Gobang.wall)
    }
    // 竖
    for (let a = -4; a <= 4; a++) {
      if (centerI + a >= minI && centerI + a <= maxI) rst[1].push(this.node[centerI + a][centerJ])
      else rst[1].push(Gobang.wall)
    }
    // 左斜
    for (let a = 4; a > 0; a--) {
      if (centerI + a <= maxI && centerJ - a >= minJ) rst[2].push(this.node[centerI + a][centerJ - a])
      else rst[2].push(Gobang.wall)
    }
    rst[2].push(this.node[centerI][centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI - a >= minI && centerJ + a <= maxJ) rst[2].push(this.node[centerI - a][centerJ + a])
      else rst[2].push(Gobang.wall)
    }
    // 右斜
    for (let a = 4; a > 0; a--) {
      if (centerI - a >= minI && centerJ - a >= minJ) rst[3].push(this.node[centerI - a][centerJ - a])
      else rst[3].push(Gobang.wall)
    }
    rst[3].push(this.node[centerI][centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI + a <= maxI && centerJ + a <= maxJ) rst[3].push(this.node[centerI + a][centerJ + a])
      else rst[3].push(Gobang.wall)
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
    if (this.node[i][j] !== Gobang.empty) {
      this.maxPointsSocre[i][j] = 0
      this.minPointsSocre[i][j] = 0
    } else {
      // console.log(position, this.maxPointsSocre)
      this.maxPointsSocre[i][j] = this.evaPoint(i, j, Gobang.max)
      this.minPointsSocre[i][j] = this.evaPoint(i, j, Gobang.min)
    }
  }

  /**
   * 启发式搜索
   * 假如在此处落子后, 米字线上能得到的分数, 即为该点的分数
   */
  evaPoint(i, j, role) {
    const chessInFourDirection = this.getChessInFourDirection(i, j)
    const chess = role === Gobang.max ? Gobang.max : Gobang.min
    const block = role === Gobang.max ? Gobang.min : Gobang.max
    const countFn = countLine(chess, block, Gobang.wall)
    let rst = 0
    this.enableLog && console.log({ chessInFourDirection })
    chessInFourDirection.forEach((m) => {
      const count = countFn(m)
      this.enableLog && console.log(count, m)
      const socre = countLineSocre[count]
      rst += socre || 0
    })
    // console.log(rst)
    return rst
  }

  // 优先返回己方能获胜的点, 己方不能获胜时防止对方获胜
  orderPoints(points, role) {
    let max5 = []
    let min5 = []
    let max4 = []
    let min4 = []
    let maxMore3 = []
    let minMore3 = []
    let max3 = []
    let min3 = []
    let maxDead4 = []
    let minDead4 = []
    let maxMore2 = []
    let minMore2 = []
    let max2 = []
    let min2 = []
    let maxOtherNoMatter = []
    let minOtherNoMatter = []

    points.forEach((point) => {
      const [i, j] = point
      const maxSocre = this.maxPointsSocre[i][j]
      // 这里 if-else 顺序很重要, 一定要是`值大`的在前
      if (maxSocre >= Socre.live5) max5.push(point)
      else if (maxSocre >= Socre.live4) max4.push(point)
      else if (maxSocre >= Socre.dead4 + Socre.live3) maxMore3.push(point)
      else if (maxSocre >= Socre.dead4) maxDead4.push(point)
      else if (maxSocre >= Socre.live3) max3.push(point)
      else if (maxSocre >= 2 * Socre.live2) maxMore2.push(point)
      else if (maxSocre >= Socre.live2) max2.push(point)
      else maxOtherNoMatter.push(point)

      const minSocre = this.minPointsSocre[i][j]
      if (minSocre >= Socre.live5) min5.push(point)
      else if (minSocre >= Socre.live4) min4.push(point)
      else if (minSocre >= Socre.dead4 + Socre.live3) minMore3.push(point)
      else if (minSocre >= Socre.dead4) minDead4.push(point)
      else if (minSocre >= Socre.live3) min3.push(point)
      else if (minSocre >= 2 * Socre.live2) minMore2.push(point)
      else if (minSocre >= Socre.live2) min2.push(point)
      else minOtherNoMatter.push(point)
    })

    /** 优先级
     * 己方连5
     * 对方连5
     * 己方活四
     * 对方活四
     * 己方双三
     * 对方双三
     * 己方活二
     * 对方活二
     * 己方Dead4  dead4  需要考虑啥?
     * 对方Dead4
     */
    let rst = []
    if (role === Gobang.max) {
      // console.log({ max5, min5, max4, min4 })
      if (max5.length) return max5
      if (min5.length) return min5
      if (max4.length) return max4
      if (min4.length) return min4
      if (maxMore3.length) return maxMore3
      if (minMore3.length) return minMore3
      rst = rst
        .concat(max3)
        // .concat(min3)
        .concat(maxMore2)
        // .concat(minMore2)
        .concat(maxDead4)
        // .concat(minDead4)
        .concat(max2)
        // .concat(min2)
        .concat(maxOtherNoMatter)
    } else {
      if (min5.length) return min5
      if (max5.length) return max5
      if (min4.length) return min4
      if (max4.length) return max4
      if (minMore3.length) return minMore3
      if (maxMore3.length) return maxMore3
      rst = rst
        .concat(min3)
        // .concat(max3)
        .concat(minMore2)
        // .concat(maxMore2)
        .concat(minDead4)
        // .concat(maxDead4)
        .concat(min2)
        // .concat(max2)
        .concat(minOtherNoMatter)
    }
    // return points
    rst.length !== points.length && console.log(`rst.length !== points.length`)
    return rst.length <= Gobang.genLimit ? rst : rst.slice(0, Gobang.genLimit)
  }

  // 统计性能优化数据
  initStats() {
    // AB剪枝
    this.stats = {
      abCut: {
        all: Math.pow(Gobang.genLimit, Gobang.defaultDepth),
        eva: 0,
        cut: 0,
        toString() {
          const { all, eva, cut } = this.stats.abCut
          const realCut = all - eva
          // 节点总数是理论最大值, 实际达不到 (对弈到某一步时, 例如对手已有冲四, 或己方能形成活四, 则下一步只有唯一的选择)
          return `AB剪枝 最大节点总数:${all} 理论最少评估${Math.pow(all, 0.5)} 实际评估:${eva} 剪去:${cut}/${realCut}`
        },
      },
      zobrist: {
        miss: 0,
        hit: 0,
        toString() {
          const { hit, miss } = this.stats.zobrist
          return `zobrist 评估节点数:${this.stats.abCut.eva} hit:${hit} miss:${miss}`
        },
      },
    }
  }
  logStats() {
    Object.keys(this.stats).forEach((m) => {
      console.log(this.stats[m].toString.call(this))
    })
  }
}
