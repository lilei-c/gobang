import { calcEvaPointScore, getPointMode } from './genLineScore'

export function genChilds(points, isMax, kill) {
  let maxL5 = []
  let minL5 = []
  let maxL4 = []
  let minL4 = []
  let maxD4 = []
  let minD4 = []
  let maxL3 = []
  let minL3 = []
  // 双冲四
  let maxDoubleD4 = []
  let minDoubleD4 = []
  // 活三 + 冲四
  let maxD4L3 = []
  let minD4L3 = []
  // 双三
  let maxDoubleL3 = []
  let minDoubleL3 = []

  let pointsWithScore = []
  for (let a = 0; a < points.length; a++) {
    const point = points[a]
    const [i, j] = point
    let maxScore = 0
    let minScore = 0

    // max 棋型统计
    let directionZeroMode = getPointMode(this.maxPointsScore[i][j][0])
    {
      const directionOneMode = getPointMode(this.maxPointsScore[i][j][1])
      const directionTwoMode = getPointMode(this.maxPointsScore[i][j][2])
      const directionThreeMode = getPointMode(this.maxPointsScore[i][j][3])
      // 四个方向累加
      directionZeroMode.l5 += directionOneMode.l5 + directionTwoMode.l5 + directionThreeMode.l5
      directionZeroMode.l4 += directionOneMode.l4 + directionTwoMode.l4 + directionThreeMode.l4
      directionZeroMode.d4 += directionOneMode.d4 + directionTwoMode.d4 + directionThreeMode.d4
      directionZeroMode.l3 += directionOneMode.l3 + directionTwoMode.l3 + directionThreeMode.l3
      directionZeroMode.d3 += directionOneMode.d3 + directionTwoMode.d3 + directionThreeMode.d3
      directionZeroMode.l2 += directionOneMode.l2 + directionTwoMode.l2 + directionThreeMode.l2
      directionZeroMode.d2 += directionOneMode.d2 + directionTwoMode.d2 + directionThreeMode.d2
      directionZeroMode.l1 += directionOneMode.l1 + directionTwoMode.l1 + directionThreeMode.l1
      const { l5, l4, d4, l3 } = directionZeroMode
      if (l5) maxL5.push(point)
      else if (l4) maxL4.push(point)
      else {
        if (d4 > 1) maxDoubleD4.push(point)
        if (l3 && d4) maxD4L3.push(point)
        if (l3 > 1) maxDoubleL3.push(point)
        if (l3) maxL3.push(point)
        if (d4) maxD4.push(point)
      }
      maxScore = calcEvaPointScore(directionZeroMode)
    }

    // min 棋型统计
    let minDirectionZeroMode = getPointMode(this.minPointsScore[i][j][0])
    {
      const directionOneMode = getPointMode(this.minPointsScore[i][j][1])
      const directionTwoMode = getPointMode(this.minPointsScore[i][j][2])
      const directionThreeMode = getPointMode(this.minPointsScore[i][j][3])
      // 四个方向累加
      minDirectionZeroMode.l5 += directionOneMode.l5 + directionTwoMode.l5 + directionThreeMode.l5
      minDirectionZeroMode.l4 += directionOneMode.l4 + directionTwoMode.l4 + directionThreeMode.l4
      minDirectionZeroMode.d4 += directionOneMode.d4 + directionTwoMode.d4 + directionThreeMode.d4
      minDirectionZeroMode.l3 += directionOneMode.l3 + directionTwoMode.l3 + directionThreeMode.l3
      minDirectionZeroMode.d3 += directionOneMode.d3 + directionTwoMode.d3 + directionThreeMode.d3
      minDirectionZeroMode.l2 += directionOneMode.l2 + directionTwoMode.l2 + directionThreeMode.l2
      minDirectionZeroMode.d2 += directionOneMode.d2 + directionTwoMode.d2 + directionThreeMode.d2
      minDirectionZeroMode.l1 += directionOneMode.l1 + directionTwoMode.l1 + directionThreeMode.l1
      const { l5, l4, d4, l3 } = minDirectionZeroMode
      // console.log({ allMode, directionZeroMode, directionOneMode, directionTwoMode, directionThreeMode })
      if (l5) minL5.push(point)
      else if (l4) minL4.push(point)
      else {
        if (d4 > 1) minDoubleD4.push(point)
        if (l3 && d4) minD4L3.push(point)
        if (l3 > 1) minDoubleL3.push(point)
        if (l3) minL3.push(point)
        if (d4) minD4.push(point)
      }
      minScore = calcEvaPointScore(minDirectionZeroMode)
    }

    // 无论 max 还是 min, 都是考虑 maxScore + minScore, 原理是: 无论我方还是对方能在此获得较大分数, 都应抢占这个地方
    // pointsWithScore.push({ position: [i, j], score: maxScore + minScore })
    pointsWithScore.push({ position: [i, j], score: maxScore * this.attackFactor + minScore * this.defenseFactor })
  }
  let rst
  if (isMax) {
    if (kill) {
      // console.log({ maxL5, maxL4, maxDoubleD4, maxD4L3, maxD4, maxDoubleL3, maxL3 })
      // 算杀只考虑 max 方连续进攻, min 方不需要判断算杀
      if (maxL5.length) return maxL5
      if (minL5.length) return []
      if (maxL4.length) return maxL4
      if (maxDoubleD4.length) return maxDoubleD4
      // 冲四+活三 不一定好于单独冲四, 试想, 冲四+活三被拦截且对方形成四, 那这个冲四+活三就没用
      // 而单独冲四虽被对手拦截, 但对手不能成四, 基于这个冲四后续, 我方可以形成杀棋, 则最先的单独冲四才是正解
      if (maxD4L3.length || maxD4.length) return maxD4L3.concat(maxD4)
      // if (maxD4L3.length) return maxD4L3
      // if (maxD4.length) return maxD4
      if (minL4.length || minD4.length) return []
      // 双三可以考虑一下, 考虑活三性能会很差
      // 如果考虑三, 搜索时, min 方的启发函数不应剪切棋子, 否则算杀有概率失误
      if (maxDoubleL3.length) return maxDoubleL3
      if (maxL3.length) return maxL3
      return []
    }
    // console.log({ kill, maxL5, minL5, maxL4, maxD4L3, minL4, minD4L3, maxDoubleL3, minDoubleL3 })
    if (maxL5.length) return maxL5
    if (minL5.length) return minL5
    if (maxL4.length) return maxL4
    if (minL4.length) return minL4
    if (maxD4L3.length) return maxD4L3 // 不严谨, 如果刚好对方拦截冲四的同时, 它也形成冲四, 则冲四+活三就不是稳赢了
    if (minD4L3.length) return minD4L3
  } else {
    if (minL5.length) return minL5
    if (maxL5.length) return maxL5
    if (minL4.length) return minL4
    if (maxL4.length) return maxL4
    if (minD4L3.length) return minD4L3 // 不严谨, 如果刚好对方拦截冲四的同时, 它也形成冲四, 则冲四+活三就不是稳赢了
    if (maxD4L3.length) return maxD4L3
  }
  rst = pointsWithScore.sort((a, b) => b.score - a.score).map((x) => x.position)

  if (rst.length <= this.genLimit) return rst
  return rst.slice(0, this.genLimit)
}
