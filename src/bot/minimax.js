import { boardLength, boardCenter, min } from './const'
import { countLine, ninePointMode, Score, getPointMode, chessModeBit } from './genLineScore'
import { arrayN } from './support'
import { Zobrist } from './zobrist'

const EMPTY = 0
const MAX = 1
const MIN = 2
const WALL = 3
const { l1, d2, l2, l2x2, d3, l3, d4, l4, l5 } = chessModeBit

export class Gobang {
  constructor({ firstHand }) {
    this.totalChessPieces = boardLength * boardLength
    this.node = arrayN(boardLength).map((_) => arrayN(boardLength, EMPTY))
    this.initNode()
    this.stack = []
    this.zobrist = new Zobrist({ size: boardLength })
    this.maxPointsScore = arrayN(boardLength).map((_) => arrayN(boardLength, null))
    this.minPointsScore = arrayN(boardLength).map((_) => arrayN(boardLength, null))
    this.stats = {} // 统计性能优化数据
    this.enableStats = true // 记录 stats
    this.enableLog = false
    this.firstHand = firstHand || MIN
    this.genLimit = 60 // 启发式搜索, 选取节点数
    this.seekDepth = 4
    this.kilSeeklDepth = 15 // 算杀只需要奇数步, 因为只判断最后一步我方落子是否取胜
  }
  static MAX = MAX
  static MIN = MIN
  static EMPTY = EMPTY
  static WALL = WALL

  isWall(i, j) {
    return i < 0 || i >= boardLength || j < 0 || j >= boardLength
  }

  initNode() {
    // 横
    this.node1 = arrayN(boardLength, 0b000000000000000000000000000000)
    // 竖
    const buffer = new ArrayBuffer(4 * 15)
    this.node2 = new Int32Array(buffer)
    for (let i = 0; i <= 14; i++) this.node2[i] = 0b000000000000000000000000000000
    // 左斜
    // 0  0,0
    // 1  0,1  1,0
    // 2  0,2  1,1  2,0
    // 从上往下数15行, 棋盘外的设置为墙, 点击 i,j 时, 做如下计算
    // 行数:i+j
    // bit位(高->低):i
    this.node3 = []
    for (let rowsIndex = 0; rowsIndex < boardLength * 2 - 1; rowsIndex++) {
      let rst = 0b0
      for (let i = 0; i < 15; i++) {
        const j = rowsIndex - i
        rst <<= 2
        if (this.isWall(i, j)) {
          rst += 0b11
        }
      }
      this.node3[rowsIndex] = rst
    }
    // 右斜
    // 0  0,14 1,15
    // 1  0,13 1,14
    // 从上往下数 (固定0-14行, 棋盘外的设置为墙)
    // 行数:14+i-j
    // bit位(高->低):i
    this.node4 = []
    for (let rowsIndex = 0; rowsIndex < boardLength * 2 - 1; rowsIndex++) {
      let rst = 0b0
      for (let i = 0; i < 15; i++) {
        const j = 14 + i - rowsIndex
        rst <<= 2
        if (this.isWall(i, j)) {
          rst += 0b11
        }
      }
      this.node4[rowsIndex] = rst
    }
  }

  put(position, role) {
    const [i, j] = position
    this.node[i][j] = role
    this.zobrist.go(i, j, role === MAX)
    this.stack.push(position)

    // 横
    this.node1[i] = this.node1[i] | (role << (2 * (14 - j)))
    // 竖
    this.node2[j] = this.node2[j] | (role << (2 * (14 - i)))
    // 左斜
    this.node3[i + j] = this.node3[i + j] | (role << (2 * (14 - i)))
    // 右斜
    this.node4[14 + i - j] = this.node4[14 + i - j] | (role << (2 * (14 - i)))

    this.updateFourLineScore(i, j)
  }

  rollback(steps = 1) {
    if (this.stack.length < steps) return
    while (steps-- > 0) {
      const [i, j] = this.stack.pop()
      this.zobrist.go(i, j, this.getChess(i, j) === MAX)
      this.node[i][j] = EMPTY

      // 横
      const move1 = 2 * (14 - j)
      this.node1[i] = (this.node1[i] | (0b11 << move1)) ^ (0b11 << move1)
      // 竖
      const move2 = 2 * (14 - i)
      this.node2[j] = (this.node2[j] | (0b11 << move2)) ^ (0b11 << move2)
      // 左斜
      this.node3[i + j] = (this.node3[i + j] | (0b11 << move2)) ^ (0b11 << move2)
      // 右斜
      this.node4[14 + i - j] = (this.node4[14 + i - j] | (0b11 << move2)) ^ (0b11 << move2)

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
    // 前几个落子剪枝效率不高, 搜索层数少点
    if (score && score[0] >= Score.win) {
      console.warn('算杀成功 :)')
    } else {
      console.time('thinking')
      score = this.minimax(this.stack.length < 6 ? 4 : this.seekDepth)
      console.timeEnd('thinking')
    }
    console.log({ score })
    this.put(score[1], MAX)
    this.logStats()
    console.log('score', this.evaluate(false, true))
    return score
  }

  minGo(i, j) {
    if (this.isFinal) return
    if (!this.isEmptyPosition(i, j)) return false
    this.put([i, j], MIN)
    console.log('score', this.evaluate())
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
    return (this.node1[i] >> (2 * (14 - j))) & 0b11
  }

  minimax(depth, kill, alpha = -Infinity, beta = Infinity, isMax = true) {
    if (this.isFinal || depth === 0) {
      const score = this.evaluate(kill)
      return [score, null]
    }
    const orderedPoints = this.orderPoints(this.getAllOptimalNextStep(), isMax ? MAX : MIN, kill)
    if (isMax) {
      let val = -Infinity
      let nextPosition = orderedPoints && orderedPoints[0] // 即使所有评分都等于 -Infinity (必输局), 也要随便走一步
      for (const childPosition of orderedPoints) {
        this.put(childPosition, MAX)
        this.enableStats && this.stats.abCut.eva++
        let childVal = this.zobrist.get()
        if (childVal === undefined) {
          childVal = this.minimax(depth - 1, kill, alpha, beta, !isMax)[0]
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
      return [val, nextPosition]
    } else {
      let val = Infinity
      let nextPosition = orderedPoints && orderedPoints[0]
      for (const childPosition of orderedPoints) {
        this.put(childPosition, MIN)
        this.enableStats && this.stats.abCut.eva++
        let childVal = this.zobrist.get()
        if (childVal === undefined) {
          childVal = this.minimax(depth - 1, kill, alpha, beta, !isMax)[0]
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
      return [val, nextPosition]
    }
  }

  getChessInFourDirection(centerI, centerJ) {
    let rst = [[], [], [], []]
    // 横
    const s = this.node1[centerI]
    const s1 = centerJ >= 4 ? (s >> (2 * (18 - centerJ))) & 0b11 : 0b11
    const s2 = centerJ >= 3 ? (s >> (2 * (17 - centerJ))) & 0b11 : 0b11
    const s3 = centerJ >= 2 ? (s >> (2 * (16 - centerJ))) & 0b11 : 0b11
    const s4 = centerJ >= 1 ? (s >> (2 * (15 - centerJ))) & 0b11 : 0b11
    const s5 = (s >> (2 * (14 - centerJ))) & 0b11
    const s6 = centerJ <= 13 ? (s >> (2 * (13 - centerJ))) & 0b11 : 0b11
    const s7 = centerJ <= 12 ? (s >> (2 * (12 - centerJ))) & 0b11 : 0b11
    const s8 = centerJ <= 11 ? (s >> (2 * (11 - centerJ))) & 0b11 : 0b11
    const s9 = centerJ <= 10 ? (s >> (2 * (10 - centerJ))) & 0b11 : 0b11
    rst[0] = [s1, s2, s3, s4, s5, s6, s7, s8, s9]
    // 竖
    const v = this.node2[centerJ]
    const v1 = centerI >= 4 ? (v >> (2 * (18 - centerI))) & 0b11 : 0b11
    const v2 = centerI >= 3 ? (v >> (2 * (17 - centerI))) & 0b11 : 0b11
    const v3 = centerI >= 2 ? (v >> (2 * (16 - centerI))) & 0b11 : 0b11
    const v4 = centerI >= 1 ? (v >> (2 * (15 - centerI))) & 0b11 : 0b11
    const v5 = (v >> (2 * (14 - centerI))) & 0b11
    const v6 = centerI <= 13 ? (v >> (2 * (13 - centerI))) & 0b11 : 0b11
    const v7 = centerI <= 12 ? (v >> (2 * (12 - centerI))) & 0b11 : 0b11
    const v8 = centerI <= 11 ? (v >> (2 * (11 - centerI))) & 0b11 : 0b11
    const v9 = centerI <= 10 ? (v >> (2 * (10 - centerI))) & 0b11 : 0b11
    rst[1] = [v1, v2, v3, v4, v5, v6, v7, v8, v9]
    // 左斜
    const l = this.node3[centerI + centerJ]
    const l1 = centerI >= 4 ? (l >> (2 * (18 - centerI))) & 0b11 : 0b11
    const l2 = centerI >= 3 ? (l >> (2 * (17 - centerI))) & 0b11 : 0b11
    const l3 = centerI >= 2 ? (l >> (2 * (16 - centerI))) & 0b11 : 0b11
    const l4 = centerI >= 1 ? (l >> (2 * (15 - centerI))) & 0b11 : 0b11
    const l5 = (l >> (2 * (14 - centerI))) & 0b11
    const l6 = centerI <= 13 ? (l >> (2 * (13 - centerI))) & 0b11 : 0b11
    const l7 = centerI <= 12 ? (l >> (2 * (12 - centerI))) & 0b11 : 0b11
    const l8 = centerI <= 11 ? (l >> (2 * (11 - centerI))) & 0b11 : 0b11
    const l9 = centerI <= 10 ? (l >> (2 * (10 - centerI))) & 0b11 : 0b11
    rst[2] = [l1, l2, l3, l4, l5, l6, l7, l8, l9]
    // 右斜
    const rr = this.node4[14 + centerI - centerJ]
    const rr1 = centerI >= 4 ? (rr >> (2 * (18 - centerI))) & 0b11 : 0b11
    const rr2 = centerI >= 3 ? (rr >> (2 * (17 - centerI))) & 0b11 : 0b11
    const rr3 = centerI >= 2 ? (rr >> (2 * (16 - centerI))) & 0b11 : 0b11
    const rr4 = centerI >= 1 ? (rr >> (2 * (15 - centerI))) & 0b11 : 0b11
    const rr5 = (rr >> (2 * (14 - centerI))) & 0b11
    const rr6 = centerI <= 13 ? (rr >> (2 * (13 - centerI))) & 0b11 : 0b11
    const rr7 = centerI <= 12 ? (rr >> (2 * (12 - centerI))) & 0b11 : 0b11
    const rr8 = centerI <= 11 ? (rr >> (2 * (11 - centerI))) & 0b11 : 0b11
    const rr9 = centerI <= 10 ? (rr >> (2 * (10 - centerI))) & 0b11 : 0b11
    rst[3] = [rr1, rr2, rr3, rr4, rr5, rr6, rr7, rr8, rr9]
    return rst
  }

  //
  getPositionsInFourDirection(i, j) {
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

  // i,j 米字线上的点都需要更新
  updateFourLineScore(i, j) {
    const positionsInFourDirection = this.getPositionsInFourDirection(i, j)
    // console.log(fourLinePoints)
    for (let a = 0; a < positionsInFourDirection.length; a++) {
      this.updatePointScore(positionsInFourDirection[a])
    }
  }

  //
  updatePointScore(position) {
    const [i, j] = position
    if (this.getChess(i, j) !== EMPTY) {
      this.maxPointsScore[i][j] = 0
      this.maxPointsScore[i][j] = 0
    } else {
      // 这里 evaPoint 的 getChessInFourDirection 重复, 可以优化
      this.maxPointsScore[i][j] = this.evaPoint(i, j, MAX)
      this.minPointsScore[i][j] = this.evaPoint(i, j, MIN)
    }
  }

  /**
   * 启发式搜索
   * 假如在此处落子后, 米字线上能得到的分数, 即为该点的分数
   */
  evaPoint(i, j, role) {
    const chessInFourDirection = this.getChessInFourDirection(i, j)
    const chess = role === MAX ? MAX : MIN
    const block = role === MAX ? MIN : MAX
    const countFn = countLine(chess, block, WALL)
    let rst = 0
    for (let a = 0; a < 4; a++) {
      const count = countFn(chessInFourDirection[a])
      const score = ninePointMode[count]
      rst += score || 0
    }
    return rst
  }

  orderPoints(points, role, kill) {
    let maxL5 = []
    let minL5 = []
    let maxL4 = []
    let minL4 = []
    let maxD4 = []
    let minD4 = []
    let maxL3 = []
    let minL3 = []
    let maxD3 = []
    let minD3 = []
    let maxL2 = []
    let minL2 = []
    let maxD2 = []
    let minD2 = []
    // 不构成棋型的点
    let maxOtherNoMatter = []
    let minOtherNoMatter = []
    // 双三
    let maxDoubleL3 = []
    let minDoubleL3 = []
    // 活三 + 冲四
    let maxD4L3 = []
    let minD4L3 = []
    // 两个活二
    let maxDoubleL2 = []
    let minDoubleL2 = []
    // 2个以上活二
    let maxMoreL2 = []
    let minMoreL2 = []

    // max 棋型统计
    for (let a = 0; a < points.length; a++) {
      const point = points[a]
      const [i, j] = point
      const pointMode = getPointMode(this.maxPointsScore[i][j])
      const { l5, l4, d4, l3, d3, l2, d2 } = pointMode
      if (l5) maxL5.push(point)
      else if (l4) maxL4.push(point)
      else if (l3 && d4) maxD4L3.push(point)
      else if (l3 > 1) maxDoubleL3.push(point)
      else if (l2 > 2) maxMoreL2.push(point)
      else if (l3) maxL3.push(point)
      else if (l2 > 1) maxDoubleL2.push(point)
      else if (d4) maxD4.push(point)
      else if (l2) maxL2.push(point)
      else if (d3) maxD3.push(point)
      else if (d2) maxD2.push(point)
      else maxOtherNoMatter.push(point)
    }

    // min 棋型统计
    for (let a = 0; a < points.length; a++) {
      const point = points[a]
      const [i, j] = point
      const pointMode = getPointMode(this.minPointsScore[i][j])
      const { l5, l4, d4, l3, d3, l2, d2 } = pointMode
      if (l5) minL5.push(point)
      else if (l4) minL4.push(point)
      else if (l3 && d4) minD4L3.push(point)
      else if (l3 > 1) minDoubleL3.push(point)
      else if (l2 > 2) minMoreL2.push(point)
      else if (l3) minL3.push(point)
      else if (l2 > 1) minDoubleL2.push(point)
      else if (d4) minD4.push(point)
      else if (l2) minL2.push(point)
      else if (d3) minD3.push(point)
      else if (d2) minD2.push(point)
      else minOtherNoMatter.push(point)
    }

    if (role === MAX) {
      if (kill) {
        // 算杀只考虑 max 方连续进攻, min 方不需要判断算杀
        if (maxL5.length) return maxL5
        if (minL5.length) return []
        if (maxL4.length) return maxL4
        if (maxD4L3.length || maxD4.length) return maxD4L3.concat(maxD4)
        if (minL4.length) return [] // minL4
        if (minD4L3.length) return [] //minD4L3
        // 双三可以考虑一下
        if (maxDoubleL3.length && !minD4.length && !minD4L3.length) return maxDoubleL3
        // 考虑活三性能会很差
        // if (maxL3.length) return maxL3
        return []
      }
      // console.log({ kill, role, maxL5, minL5, maxL4, maxD4L3, minL4, minD4L3, maxDoubleL3, minDoubleL3 })
      if (maxL5.length) return maxL5
      if (minL5.length) return minL5
      if (maxL4.length) return maxL4
      if (maxD4L3.length) return maxD4L3
      if (minL4.length) return minL4
      if (minD4L3.length) return minD4L3
      if (maxDoubleL3.length) return maxDoubleL3 // 双三可考虑对方是否有冲四且拦截己方双三
      if (minDoubleL3.length) return minDoubleL3
      // !! 这里的顺序和选子很重要, 影响棋力和剪枝效率, 最好和评估函数保持一致
      const rst = maxMoreL2
        .concat(minMoreL2)
        .concat(maxL3)
        .concat(minL3)
        .concat(maxDoubleL2)
        .concat(minDoubleL2)
        .concat(maxD4)
        .concat(minD4)
        .concat(maxL2)
        .concat(minL2)
        .concat(maxOtherNoMatter)
        .concat(maxD3)
        .concat(minD3)
        .concat(maxD2)
        .concat(minD2)
      return rst.length <= this.genLimit ? rst : rst.slice(0, this.genLimit)
    } else {
      if (minL5.length) return minL5
      if (maxL5.length) return maxL5
      if (minL4.length) return minL4
      if (minD4L3.length) return minD4L3
      if (maxL4.length) return maxL4
      if (maxD4L3.length) return maxD4L3
      if (minDoubleL3.length) return minDoubleL3 // 双三可考虑对方是否有冲四且拦截己方双三
      if (maxDoubleL3.length) return maxDoubleL3
      // !! 这里的顺序和选子很重要, 影响棋力和剪枝效率, 最好和评估函数保持一致
      const rst = minMoreL2
        .concat(maxMoreL2)
        .concat(minL3)
        .concat(maxL3)
        .concat(minDoubleL2)
        .concat(maxDoubleL2)
        .concat(minD4)
        .concat(maxD4)
        .concat(minL2)
        .concat(maxL2)
        .concat(minOtherNoMatter)
        .concat(minD3)
        .concat(maxD3)
        .concat(minD2)
        .concat(maxD2)
      return rst.length <= this.genLimit ? rst : rst.slice(0, this.genLimit)
    }
  }

  // !!!!!!!!   node3, node4 可以各删除 首尾四行
  // 完了尝试 下棋时更新4行评分, 看看两者效率差距
  // 记录行列, 只更新下过子的地方?
  evaluate(kill, log) {
    const winner = this.winner
    if (winner === MAX) return Score.win
    else if (winner === MIN) return -Score.win
    if (kill) return 0 // 算杀结果必须是5连, 否则算杀失败

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
      // log && console.log(piece.toString(2))
      if (piece < 0b100010) return
      const pieceMode = ninePointMode[piece]
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
          case l2x2:
            return (maxL2 += 2)
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
            return console.erroe('error')
        }
      } else {
        switch (pieceMode) {
          case l1:
            return minL1++
          case d2:
            return minD2++
          case l2:
            return minL2++
          case l2x2:
            return (minL2 += 2)
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
            return console.erroe('error')
        }
      }
    }

    const check = (chess, block, line) => {
      let piece = 0b1
      let emptyCount = 0
      let isBreak = false

      // 评分是用的连续9子的评分, 这里一行有 15 个子, 能行么?
      // 大概率可行? , 一行超过连续 9 子只有某一方棋子和单个空格, 这个概率很低
      // 010101010, 最多是这样连续9子, 两边不可能再加了, 因为 max 不可能下两边不下中间
      // 0101000101 只能是类似这种, 中间先空出来, 最后在中间落子, 这个概率很低吧?
      // 如果要非常严谨, 可以把超过9子的情况也加到 Score map 中去
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
            if ((line & 0b1100) === EMPTY && i != 14) piece <<= 1
            readAndCountScore(chess, piece)
            // 被空位截断的, 后续读子时要把空位算上
            piece = 0b100
            if ((line & 0b1100) === EMPTY && i != 14) piece <<= 1
            // console.error(line & (0b11 << (2 * (i - 2))), { p: piece.toString(2) })
            emptyCount = 0
            isBreak = true
            continue
          }
        } else {
          emptyCount = 0
          isBreak = false
          piece <<= 1
          piece += 1
          // console.warn({ p: piece.toString(2) })
        }
      }
      // 读分, 这里要判断结束时是否是被截断, 防止重复计分
      if (!isBreak) {
        readAndCountScore(chess, piece)
      }
    }

    // console.log(check(MAX, MIN, 0b1011000000000001111))
    // log && console.log(check(MIN, MAX, 0b10001000100000000000))
    // return
    // max
    for (let a = 0; a < this.node1.length; a++) check(MAX, MIN, this.node1[a])
    for (let a = 0; a < this.node2.length; a++) check(MAX, MIN, this.node2[a])
    for (let a = 0; a < this.node3.length; a++) check(MAX, MIN, this.node3[a])
    for (let a = 0; a < this.node4.length; a++) check(MAX, MIN, this.node4[a])
    // min
    for (let a = 0; a < this.node1.length; a++) check(MIN, MAX, this.node1[a])
    for (let a = 0; a < this.node2.length; a++) check(MIN, MAX, this.node2[a])
    for (let a = 0; a < this.node3.length; a++) check(MIN, MAX, this.node3[a])
    for (let a = 0; a < this.node4.length; a++) check(MIN, MAX, this.node4[a])

    if (log) {
      console.log({ maxL1, maxD2, maxL2, maxD3, maxL3, maxD4, maxL4, maxL5 })
      console.log({ minL1, minD2, minL2, minD3, minL3, minD4, minL4, minL5 })
    }

    let maxScore = 0
    let minScore = 0
    // 搜索结束后, 下一个是谁下棋
    const seekEndAndNextIsMax = (this.seekDepth & 0b1) === 0
    if (seekEndAndNextIsMax) {
      if (maxL4 || maxD4) return Score.l5
      if (minL4) return -Score.l5
      if (minL3 & minD4) return -Score.l5 // 不严谨, 有可能被一颗子拦截
      if (maxL3) {
        if (!minL4) maxScore += Score.l4
        if (maxL3 > 1) maxScore += Score.l3 * 2 // 额外奖励, 可调整
      }
    } else {
      if (minL4 || minD4) return -Score.l5
      if (maxL4) return Score.l5
      if (maxL3 & maxD4) return Score.l5 // 不严谨, 有可能被一颗子拦截
      if (minL3) {
        if (!maxL4) minScore += Score.l4
        if (minL3 > 1) minScore += Score.l3 * 2 // 额外奖励, 可调整
      }
    }
    if (maxL2 > 2) maxScore += Score.l2 // 额外奖励, 可调整
    if (minL2 > 2) minScore += Score.l2 // 额外奖励, 可调整
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
    // 后手时, 加强防守
    let score = maxScore - minScore * (this.firstHand === MIN ? 5 : 1)
    return score
  }

  get winner() {
    if (this.stack.length < 9) return null
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

  printNode() {
    console.log(this.node1.map((x) => x.toString(2)))
    console.log(this.node2.map((x) => x.toString(2)))
    console.log(this.node3.map((x) => x.toString(2)))
    console.log(this.node4.map((x) => x.toString(2)))
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
          return `AB剪枝 最大节点总数:${all} 理论最少评估${all ** 0.5} 实际评估:${eva} 剪去:${cut}/${realCut}`
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
