import { boardLength, boardCenter, max, min } from './const'
import { evaluate } from './evaluate.js'
import { countLine, countLineScore, Score } from './genLineScore'
import { arrayN } from './support'
import { Zobrist } from './zobrist'

const EMPTY = 0
const MAX = 1
const MIN = 2
const WALL = 3

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
    this.genLimit = 20 // 启发式搜索, 选取节点数
    this.seekDepth = 6
    this.kilSeeklDepth = 21
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
  printNode() {
    console.log(this.node1.map((x) => x.toString(2)))
    console.log(this.node2.map((x) => x.toString(2)))
    console.log(this.node3.map((x) => x.toString(2)))
    console.log(this.node4.map((x) => x.toString(2)))
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
      this.zobrist.go(i, j, this.getChess(i, j) === max)
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
    if (score && score[0] >= Score.live5) {
      console.warn('算杀成功 :)')
    } else {
      console.time('thinking')
      score = this.minimax(this.stack.length < 4 ? 4 : this.seekDepth)
      console.timeEnd('thinking')
    }
    console.log({ score })
    this.put(score[1], MAX)
    this.logStats()
    console.log('score', this.evaluate2())
    return score
  }

  minGo(i, j) {
    if (this.isFinal) return
    if (!this.isEmptyPosition(i, j)) return false
    this.put([i, j], MIN)
    console.log('score', this.evaluate2())
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
      this.enableStats && this.stats.abCut.eva++
      let score = this.zobrist.get()
      if (score === undefined) {
        // score = evaluate(this.node, !isMax)
        score = this.evaluate2(kill)
        this.zobrist.set(score)
        this.enableStats && this.stats.zobrist.miss++
      } else {
        this.enableStats && this.stats.zobrist.hit++
      }
      return [score, null]
    }
    const orderedPoints = this.orderPoints(this.getAllOptimalNextStep(), isMax ? MAX : MIN, kill, depth)
    // if (kill && orderedPoints.length) console.warn(orderedPoints)
    if (isMax) {
      let val = -Infinity
      let nextPosition = orderedPoints && orderedPoints[0] // 即使所有评分都等于 -Infinity (必输局), 也要随便走一步
      for (const childPosition of orderedPoints) {
        this.put(childPosition, max)
        const childVal = this.minimax(depth - 1, kill, alpha, beta, !isMax)[0]
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
      let nextPosition = orderedPoints && orderedPoints[0]
      for (const childPosition of orderedPoints) {
        this.put(childPosition, min)
        const childVal = this.minimax(depth - 1, kill, alpha, beta, !isMax)[0]
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

    // // 旧数据结构, 顺便用于测试
    // let rstOld = [[], [], [], []]
    // const minI = centerI - 4 > 0 ? centerI - 4 : 0
    // const maxI = centerI + 4 < boardLength - 1 ? centerI + 4 : boardLength - 1
    // const minJ = centerJ - 4 > 0 ? centerJ - 4 : 0
    // const maxJ = centerJ + 4 < boardLength - 1 ? centerJ + 4 : boardLength - 1
    // // 横
    // for (let a = -4; a <= 4; a++) {
    //   if (centerJ + a >= minJ && centerJ + a <= maxJ) rstOld[0].push(this.node[centerI][centerJ + a])
    //   else rstOld[0].push(wall)
    // }
    // // 竖
    // for (let a = -4; a <= 4; a++) {
    //   if (centerI + a >= minI && centerI + a <= maxI) rstOld[1].push(this.node[centerI + a][centerJ])
    //   else rstOld[1].push(wall)
    // }
    // // 左斜
    // for (let a = 4; a > 0; a--) {
    //   if (centerI + a <= maxI && centerJ - a >= minJ) rstOld[2].push(this.node[centerI + a][centerJ - a])
    //   else rstOld[2].push(wall)
    // }
    // rstOld[2].push(this.node[centerI][centerJ])
    // for (let a = 1; a <= 4; a++) {
    //   if (centerI - a >= minI && centerJ + a <= maxJ) rstOld[2].push(this.node[centerI - a][centerJ + a])
    //   else rstOld[2].push(wall)
    // }
    // // 右斜
    // for (let a = 4; a > 0; a--) {
    //   if (centerI - a >= minI && centerJ - a >= minJ) rstOld[3].push(this.node[centerI - a][centerJ - a])
    //   else rstOld[3].push(wall)
    // }
    // rstOld[3].push(this.node[centerI][centerJ])
    // for (let a = 1; a <= 4; a++) {
    //   if (centerI + a <= maxI && centerJ + a <= maxJ) rstOld[3].push(this.node[centerI + a][centerJ + a])
    //   else rstOld[3].push(wall)
    // }
    // if (rstOld[0].join() != rst[0].join()) console.log('横', centerI, centerJ, rstOld[0], rst[0])
    // if (rstOld[1].join() != rst[1].join()) console.log('竖', centerI, centerJ, rstOld[1], rst[1])
    // if (rstOld[2].join() != rst[2].join() && rstOld[2].join() != rst[2].reverse().join())
    //   console.log('左斜', centerI, centerJ, rstOld[2], rst[2])
    // if (rstOld[3].join() != rst[3].join() && rstOld[3].join() != rst[3].reverse().join())
    //   console.log('右斜', centerI, centerJ, rstOld[3], rst[3])
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
      this.minPointsScore[i][j] = 0
    } else {
      // console.log(position, this.maxPointsScore)
      // 这里 evaPoint 的 getChessInFourDirection 重复, 可以优化
      this.minPointsScore[i][j] = this.evaPoint(i, j, MIN)
      this.maxPointsScore[i][j] = this.evaPoint(i, j, MAX)
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
    // this.enableLog && console.log({ chessInFourDirection })
    for (let a = 0; a < 4; a++) {
      const count = countFn(chessInFourDirection[a])
      // this.enableLog && console.log(count, chessInFourDirection[a])
      const score = countLineScore[count]
      rst += score || 0
    }
    // console.log(rst)
    return rst
  }

  // 优先返回己方能获胜的点, 己方不能获胜时防止对方获胜
  orderPoints(points, role, kill, depth) {
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

    for (let a = 0; a < points.length; a++) {
      const point = points[a]
      const [i, j] = point
      const maxScore = this.maxPointsScore[i][j]
      // 这里 if-else 顺序很重要, 一定要是`分大`的在前, 不然会漏掉点
      if (maxScore >= Score.live5) max5.push(point)
      else if (maxScore >= Score.live4) max4.push(point)
      // else if (maxScore >= Score.dead4 + Score.live3) maxMore3.push(point)
      else if (maxScore >= Score.dead4) maxDead4.push(point)
      else if (maxScore >= 2 * Score.live3) maxMore3.push(point)
      else if (maxScore >= Score.live3) max3.push(point)
      else if (maxScore >= 2 * Score.live2) maxMore2.push(point)
      else if (maxScore >= Score.live2) max2.push(point)
      else maxOtherNoMatter.push(point)

      const minScore = this.minPointsScore[i][j]
      if (minScore >= Score.live5) min5.push(point)
      else if (minScore >= Score.live4) min4.push(point)
      // else if (minScore >= Score.dead4 + Score.live3) minMore3.push(point)
      else if (minScore >= Score.dead4) minDead4.push(point)
      else if (minScore >= 2 * Score.live3) minMore3.push(point)
      else if (minScore >= Score.live3) min3.push(point)
      else if (minScore >= 2 * Score.live2) minMore2.push(point)
      else if (minScore >= Score.live2) min2.push(point)
      else minOtherNoMatter.push(point)
    }

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
    if (role === MAX) {
      // console.log({ max5, min5, max4, min4 })
      if (max5.length) return max5
      // 算杀第一步不能是防守杀招
      // 这样思考:
      // 如果第一步是防守杀招, 则搜索程序变成了对方的算杀, 也就是说搜索结果是基于对手连续进攻形成的
      // 如果对方不连续进攻呢? 我方还有机会么:) ,
      // 其实搜索过程中也不应该出现防守, 和第一步一样的道理
      if (min5.length && !kill) return min5
      if (max4.length) return max4
      if (kill) return maxDead4.concat(!min4.length ? maxMore3 : [])
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
      // 算杀时, 需要考虑对手防守且进攻的棋么?
      if (kill) return minDead4.concat(!max4.length ? minMore3 : [])
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
    return rst.length <= this.genLimit ? rst : rst.slice(0, this.genLimit)
  }

  evaluate2(kill) {
    const winner = this.winner
    if (winner === MAX) return Score.live5 * 10
    else if (winner === MIN) return -Score.live5 * 10
    if (kill) return 0
    let maxScore = 0
    let minScore = 0
    for (let i = 0; i < boardLength; i++)
      for (let j = 0; j < boardLength; j++) {
        maxScore += this.maxPointsScore[i][j]
        minScore += this.minPointsScore[i][j]
      }
    return maxScore - minScore * (this.firstHand === MIN ? 2 : 1.5)
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
