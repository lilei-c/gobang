import { MAX, MIN, WALL, EMPTY, boardLength, boardCenter } from './const'
import { countLine, serialPointMode, Score } from './genLineScore'
import { arrayN } from './support'
import { Zobrist } from './zobrist'
import { evaluate } from './evaluate'
import { genChilds } from './genChilds'

export class Gobang {
  constructor(props) {
    this.init({ ...props })
  }
  init({ firstHand, seekDepth, autoPlay, enableStats, attackFactor, defenseFactor }) {
    this.totalChessPieces = boardLength * boardLength
    this.initNode()
    this.stack = []
    this.zobrist = new Zobrist({ size: boardLength })
    this.maxPointsScore = arrayN(boardLength).map((_) => arrayN(boardLength, [0, 0, 0, 0]))
    this.minPointsScore = arrayN(boardLength).map((_) => arrayN(boardLength, [0, 0, 0, 0]))
    this.stats = {} // 统计性能优化数据
    this.enableStats = enableStats !== undefined ? enableStats : true // 记录 stats
    this.enableLog = false
    this.firstHand = firstHand || MIN
    this.genLimit = 20 // 启发式搜索, 选取节点数
    this.seekDepth = seekDepth || 4
    this.seekKillDepth = 17 // 算杀只需要奇数步, 因为只判断最后一步我方落子是否取胜
    this.autoPlay = autoPlay || false
    this.attackFactor = attackFactor || 1
    this.defenseFactor = defenseFactor || 2
  }
  static MAX = MAX
  static MIN = MIN
  static EMPTY = EMPTY
  static WALL = WALL

  genChilds = genChilds

  isWall(i, j) {
    return i < 0 || i >= boardLength || j < 0 || j >= boardLength
  }

  initNode() {
    // 横
    this.node0 = arrayN(boardLength, 0b000000000000000000000000000000)
    // 竖
    const buffer = new ArrayBuffer(4 * 15)
    this.node1 = new Int32Array(buffer)
    for (let i = 0; i <= 14; i++) this.node1[i] = 0b000000000000000000000000000000
    // 左斜
    // 0  0,0
    // 1  0,1  1,0
    // 2  0,2  1,1  2,0
    // 从上往下数15行, 棋盘外的设置为墙, 点击 i,j 时, 做如下计算
    // 行数:i+j
    // bit位(高->低):i
    this.node2 = []
    for (let rowsIndex = 0; rowsIndex < boardLength * 2 - 1; rowsIndex++) {
      let rst = 0b0
      for (let i = 0; i < 15; i++) {
        const j = rowsIndex - i
        rst <<= 2
        if (this.isWall(i, j)) {
          rst += 0b11
        }
      }
      this.node2[rowsIndex] = rst
    }
    // 右斜
    // 0  0,14 1,15
    // 1  0,13 1,14
    // 从上往下数 (固定0-14行, 棋盘外的设置为墙)
    // 行数:14+i-j
    // bit位(高->低):i
    this.node3 = []
    for (let rowsIndex = 0; rowsIndex < boardLength * 2 - 1; rowsIndex++) {
      let rst = 0b0
      for (let i = 0; i < 15; i++) {
        const j = 14 + i - rowsIndex
        rst <<= 2
        if (this.isWall(i, j)) {
          rst += 0b11
        }
      }
      this.node3[rowsIndex] = rst
    }
  }

  put(i, j, role) {
    this.zobrist.go(i, j, role === MAX)
    this.stack.push([i, j])

    // 横
    this.node0[i] = this.node0[i] | (role << (2 * (14 - j)))
    // 竖
    this.node1[j] = this.node1[j] | (role << (2 * (14 - i)))
    // 左斜
    this.node2[i + j] = this.node2[i + j] | (role << (2 * (14 - i)))
    // 右斜
    this.node3[14 + i - j] = this.node3[14 + i - j] | (role << (2 * (14 - i)))

    this.updateFourLineScore(i, j)
  }

  rollback(steps = 1) {
    if (this.stack.length < steps) return
    while (steps-- > 0) {
      const [i, j] = this.stack.pop()
      this.zobrist.go(i, j, this.getChess(i, j) === MAX)

      // 横
      const move1 = 2 * (14 - j)
      this.node0[i] = (this.node0[i] | (0b11 << move1)) ^ (0b11 << move1)
      // 竖
      const move2 = 2 * (14 - i)
      this.node1[j] = (this.node1[j] | (0b11 << move2)) ^ (0b11 << move2)
      // 左斜
      this.node2[i + j] = (this.node2[i + j] | (0b11 << move2)) ^ (0b11 << move2)
      // 右斜
      this.node3[14 + i - j] = (this.node3[14 + i - j] | (0b11 << move2)) ^ (0b11 << move2)

      this.updateFourLineScore(i, j)
    }
  }

  maxGo() {
    if (this.isFinal) return
    this.zobrist.resetHash()
    this.initStats()
    let score
    if (this.stack.length > 4) {
      console.time('thinking kill')
      score = this.minimax(this.seekKillDepth, true)
      console.timeEnd('thinking kill')
    }
    if (score?.score >= Score.win) {
      console.warn('算杀成功 :)')
    } else {
      console.time('thinking')
      score = this.minimax(this.seekDepth)
      console.timeEnd('thinking')
    }
    console.log({ score })
    const { i, j } = score
    this.put(i, j, MAX)
    this.logStats()
    // console.log('score', evaluate.call(this, false, true))
    return score
  }

  minGo(i, j) {
    if (this.isFinal) return
    if (!this.isEmptyPosition(i, j)) return false
    this.put(i, j, MIN)
    // console.log('score', evaluate.call(this))
    return true
  }

  minRepent() {
    if (this.stack.length >= 2) this.rollback(2)
  }

  isEmptyPosition(i, j) {
    return !this.isWall(i, j) && this.getChess(i, j) === EMPTY
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
    if (this.stack.length === 0) return [[boardCenter, boardCenter]]
    if (this.stack.length === 1) {
      if (this.isEmptyPosition(boardCenter, boardCenter)) return [[boardCenter, boardCenter]]
      const i = boardCenter + (Math.random() > 0.5 ? 1 : -1)
      const j = boardCenter + (Math.random() > 0.5 ? 1 : -1)
      return [[i, j]]
    }

    let rst = []
    for (let i = 0; i < boardLength; i++) {
      for (let j = 0; j < boardLength; j++) {
        if (this.getChess(i, j) === EMPTY && this.haveNeighbor(i, j)) rst.push([i, j])
      }
    }
    return rst
  }

  haveNeighbor(centerI, centerJ) {
    const seekStep = 2
    for (let i = -seekStep; i <= seekStep; i++) {
      if (i + centerI < 0 || i + centerI >= boardLength) continue
      for (let j = -seekStep; j <= seekStep; j++) {
        if (j + centerJ < 0 || j + centerJ >= boardLength || (i === 0 && j === 0)) continue
        const have = this.getChess(i + centerI, centerJ + j) !== EMPTY
        if (have) return true
      }
    }
    return false
  }

  getChess(i, j) {
    // todo 验证 i,j 合法
    return (this.node0[i] >> (2 * (14 - j))) & 0b11
  }

  minimax(depth, kill, alpha = -Infinity, beta = Infinity, isMax = true) {
    if (this.isFinal || depth === 0) {
      const score = evaluate.call(this, kill)
      return { score, depth }
    }
    const orderedPoints = this.genChilds(this.getAllOptimalNextStep(), isMax, kill)
    if (!orderedPoints?.length) return { score: 0 }
    if (isMax) {
      let val = -Infinity
      let nextPosition = orderedPoints[0] // 即使所有评分都等于 -Infinity (必输局), 也要随便走一步
      for (const childPosition of orderedPoints) {
        const [i, j] = childPosition
        this.put(i, j, MAX)
        this.enableStats && this.stats.abCut.eva++
        let childVal = this.zobrist.get()
        if (childVal === undefined) {
          const score = this.minimax(depth - 1, kill, alpha, beta, !isMax)
          childVal = score.score
          this.zobrist.set(childVal)
          this.enableStats && this.stats.zobrist.miss++
        } else {
          this.enableStats && this.stats.zobrist.hit++
        }
        this.rollback()
        if (childVal > val) {
          val = childVal
          nextPosition = childPosition
        }
        alpha = Math.max(alpha, val)
        // beta 剪枝
        if (beta <= alpha) {
          this.enableStats && this.stats.abCut.cut++
          break
        }
      }
      const [i, j] = nextPosition
      return { score: val, i, j }
    } else {
      let val = Infinity
      let nextPosition = orderedPoints[0]
      for (const childPosition of orderedPoints) {
        const [i, j] = childPosition
        this.put(i, j, MIN)
        this.enableStats && this.stats.abCut.eva++
        let childVal = this.zobrist.get()
        if (childVal === undefined) {
          const score = this.minimax(depth - 1, kill, alpha, beta, !isMax)
          childVal = score.score
          this.zobrist.set(childVal)
          this.enableStats && this.stats.zobrist.miss++
        } else {
          this.enableStats && this.stats.zobrist.hit++
        }
        this.rollback()
        if (childVal < val) {
          val = childVal
          nextPosition = childPosition
        }
        beta = Math.min(beta, val)
        // alpah 剪枝
        if (beta <= alpha) {
          this.enableStats && this.stats.abCut.cut++
          break
        }
      }
      const [i, j] = nextPosition
      return { score: val, i, j }
    }
  }

  getChessInFourDirection(centerI, centerJ, direction) {
    let rst0 = []
    let rst1 = []
    let rst2 = []
    let rst3 = []
    // 横
    if (direction === undefined || direction === 0) {
      const s = this.node0[centerI]
      const s1 = centerJ >= 4 ? (s >> (2 * (18 - centerJ))) & 0b11 : 0b11
      const s2 = centerJ >= 3 ? (s >> (2 * (17 - centerJ))) & 0b11 : 0b11
      const s3 = centerJ >= 2 ? (s >> (2 * (16 - centerJ))) & 0b11 : 0b11
      const s4 = centerJ >= 1 ? (s >> (2 * (15 - centerJ))) & 0b11 : 0b11
      const s5 = (s >> (2 * (14 - centerJ))) & 0b11
      const s6 = centerJ <= 13 ? (s >> (2 * (13 - centerJ))) & 0b11 : 0b11
      const s7 = centerJ <= 12 ? (s >> (2 * (12 - centerJ))) & 0b11 : 0b11
      const s8 = centerJ <= 11 ? (s >> (2 * (11 - centerJ))) & 0b11 : 0b11
      const s9 = centerJ <= 10 ? (s >> (2 * (10 - centerJ))) & 0b11 : 0b11
      rst0 = [s1, s2, s3, s4, s5, s6, s7, s8, s9]
      if (direction === 0) return rst0
    }
    // 竖
    if (direction === undefined || direction === 1) {
      const v = this.node1[centerJ]
      const v1 = centerI >= 4 ? (v >> (2 * (18 - centerI))) & 0b11 : 0b11
      const v2 = centerI >= 3 ? (v >> (2 * (17 - centerI))) & 0b11 : 0b11
      const v3 = centerI >= 2 ? (v >> (2 * (16 - centerI))) & 0b11 : 0b11
      const v4 = centerI >= 1 ? (v >> (2 * (15 - centerI))) & 0b11 : 0b11
      const v5 = (v >> (2 * (14 - centerI))) & 0b11
      const v6 = centerI <= 13 ? (v >> (2 * (13 - centerI))) & 0b11 : 0b11
      const v7 = centerI <= 12 ? (v >> (2 * (12 - centerI))) & 0b11 : 0b11
      const v8 = centerI <= 11 ? (v >> (2 * (11 - centerI))) & 0b11 : 0b11
      const v9 = centerI <= 10 ? (v >> (2 * (10 - centerI))) & 0b11 : 0b11
      rst1 = [v1, v2, v3, v4, v5, v6, v7, v8, v9]
      if (direction === 1) return rst1
    }
    // 左斜
    if (direction === undefined || direction === 2) {
      const l = this.node2[centerI + centerJ]
      const l1 = centerI >= 4 ? (l >> (2 * (18 - centerI))) & 0b11 : 0b11
      const l2 = centerI >= 3 ? (l >> (2 * (17 - centerI))) & 0b11 : 0b11
      const l3 = centerI >= 2 ? (l >> (2 * (16 - centerI))) & 0b11 : 0b11
      const l4 = centerI >= 1 ? (l >> (2 * (15 - centerI))) & 0b11 : 0b11
      const l5 = (l >> (2 * (14 - centerI))) & 0b11
      const l6 = centerI <= 13 ? (l >> (2 * (13 - centerI))) & 0b11 : 0b11
      const l7 = centerI <= 12 ? (l >> (2 * (12 - centerI))) & 0b11 : 0b11
      const l8 = centerI <= 11 ? (l >> (2 * (11 - centerI))) & 0b11 : 0b11
      const l9 = centerI <= 10 ? (l >> (2 * (10 - centerI))) & 0b11 : 0b11
      rst2 = [l1, l2, l3, l4, l5, l6, l7, l8, l9]
      if (direction === 2) return rst2
    }
    // 右斜
    if (direction === undefined || direction === 3) {
      const rr = this.node3[14 + centerI - centerJ]
      const rr1 = centerI >= 4 ? (rr >> (2 * (18 - centerI))) & 0b11 : 0b11
      const rr2 = centerI >= 3 ? (rr >> (2 * (17 - centerI))) & 0b11 : 0b11
      const rr3 = centerI >= 2 ? (rr >> (2 * (16 - centerI))) & 0b11 : 0b11
      const rr4 = centerI >= 1 ? (rr >> (2 * (15 - centerI))) & 0b11 : 0b11
      const rr5 = (rr >> (2 * (14 - centerI))) & 0b11
      const rr6 = centerI <= 13 ? (rr >> (2 * (13 - centerI))) & 0b11 : 0b11
      const rr7 = centerI <= 12 ? (rr >> (2 * (12 - centerI))) & 0b11 : 0b11
      const rr8 = centerI <= 11 ? (rr >> (2 * (11 - centerI))) & 0b11 : 0b11
      const rr9 = centerI <= 10 ? (rr >> (2 * (10 - centerI))) & 0b11 : 0b11
      rst3 = [rr1, rr2, rr3, rr4, rr5, rr6, rr7, rr8, rr9]
      if (direction === 3) return rst3
    }
    return [rst0, rst1, rst2, rst3]
  }

  getPositionsInFourDirection(centerI, centerJ) {
    let rst0 = []
    let rst1 = []
    let rst2 = []
    let rst3 = []
    const minI = centerI - 4 > 0 ? centerI - 4 : 0
    const maxI = centerI + 4 < boardLength - 1 ? centerI + 4 : boardLength - 1
    const minJ = centerJ - 4 > 0 ? centerJ - 4 : 0
    const maxJ = centerJ + 4 < boardLength - 1 ? centerJ + 4 : boardLength - 1
    // 横
    for (let j = minJ; j <= maxJ; j++) rst0.push([centerI, j])
    // 竖
    for (let i = minI; i <= maxI; i++) rst1.push([i, centerJ])
    // 左斜
    for (let a = 4; a > 0; a--) {
      if (centerI - a >= minI && centerJ + a <= maxJ) rst2.push([centerI - a, centerJ + a])
    }
    rst2.push([centerI, centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI + a <= maxI && centerJ - a >= minJ) rst2.push([centerI + a, centerJ - a])
    }
    // 右斜
    for (let a = 4; a > 0; a--) {
      if (centerI - a >= minI && centerJ - a >= minJ) rst3.push([centerI - a, centerJ - a])
    }
    rst3.push([centerI, centerJ])
    for (let a = 1; a <= 4; a++) {
      if (centerI + a <= maxI && centerJ + a <= maxJ) rst3.push([centerI + a, centerJ + a])
    }
    return [rst0, rst1, rst2, rst3]
  }

  // i,j 米字线上的点都需要更新
  updateFourLineScore(i, j) {
    const positionsInFourDirection = this.getPositionsInFourDirection(i, j)
    for (let direction = 0; direction < 4; direction++) {
      const positions = positionsInFourDirection[direction]
      for (let index = 0; index < positions.length; index++) {
        const position = positions[index]
        this.updatePointScore(position, direction)
      }
    }
  }

  //
  updatePointScore(position, direction) {
    const [i, j] = position
    if (this.getChess(i, j) !== EMPTY) {
      this.maxPointsScore[i][j] = [0, 0, 0, 0]
      this.minPointsScore[i][j] = [0, 0, 0, 0]
    } else {
      // 这里 evaPoint 的 getChessInFourDirection 重复, 可以优化
      this.maxPointsScore[i][j][direction] = this.evaPoint(i, j, MAX, direction)
      this.minPointsScore[i][j][direction] = this.evaPoint(i, j, MIN, direction)
    }
  }

  /**
   * 启发式搜索
   * 假如在此处落子后, 米字线上能得到的分数, 即为该点的分数
   */
  evaPoint(i, j, role, direction) {
    const chessInFourDirection = this.getChessInFourDirection(i, j, direction)
    const chess = role === MAX ? MAX : MIN
    const block = role === MAX ? MIN : MAX
    const countFn = countLine(chess, block, WALL)
    let rst = 0
    const count = countFn(chessInFourDirection)
    const score = serialPointMode[count]
    rst += score || 0
    return rst
  }

  saveStack() {
    console.log(JSON.stringify(this.stack))
  }

  restoreStack(stack) {
    let first = this.firstHand
    let second = first === MAX ? MIN : MAX
    for (var a = 0; a < stack.length; a++) {
      const [i, j] = stack[a]
      this.put(i, j, (a & 1) === 0 ? first : second)
    }
  }

  test(data) {
    console.log(eval(data))
  }

  get winner() {
    if (this.stack.length < 7) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.getChess(lastI, lastJ)
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

  get winnerPositions() {
    if (!this.winner) return null
    const [lastI, lastJ] = this.stack[this.stack.length - 1]
    const mayBeWinner = this.getChess(lastI, lastJ)
    const chessInFourDirection = this.getPositionsInFourDirection(lastI, lastJ)
    for (let a = 0; a < 4; a++) {
      const positions = chessInFourDirection[a]
      let count = 0
      let rst = []
      for (let b = 0; b < positions.length; b++) {
        const [i, j] = positions[b]
        if (this.getChess(i, j) === mayBeWinner) {
          count++
          rst.push([i, j])
        } else {
          count = 0
          rst = []
        }
        if (count === 5) return rst
      }
    }
    return null
  }

  get isFinal() {
    return !!this.winner || this.isBoardFull
  }

  get isBoardFull() {
    return this.stack.length === this.totalChessPieces
  }

  get lastChessPosition() {
    return this.stack.length ? this.stack[this.stack.length - 1] : null
  }

  get isDraw() {
    return this.isBoardFull && !this.winner
  }

  get node() {
    return this.node0.map((x) => {
      let rst = []
      for (let a = 0; a < boardLength; a++) {
        rst.push((x & (0b11 << (2 * a))) >> (2 * a))
      }
      return rst.reverse()
    })
  }

  printNode() {
    console.log(this.node0.map((x) => x.toString(2)))
    console.log(this.node1.map((x) => x.toString(2)))
    console.log(this.node2.map((x) => x.toString(2)))
    console.log(this.node3.map((x) => x.toString(2)))
  }

  // 统计性能优化数据
  initStats() {
    // AB剪枝
    this.stats = {
      abCut: {
        all: this.genLimit ** this.seekDepth,
        eva: 0,
        cut: 0,
        toString() {
          const { all, eva, cut } = this.stats.abCut
          const realCut = all - eva
          // 节点总数是理论最大值, 实际达不到 (对弈到某一步时, 例如对手已有冲四, 或己方能形成活四, 则下一步只有唯一的选择)
          return `AB剪枝 最大节点总数:${all} 理论最少评估${(all ** 0.5) >> 0} 实际评估:${eva} 剪去:${cut}/${realCut}`
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
    this.enableStats &&
      Object.keys(this.stats).forEach((m) => {
        console.log(this.stats[m].toString.call(this))
      })
  }
}
