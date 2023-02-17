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
  let maxD3 = []
  let minD3 = []
  let maxL2 = []
  let minL2 = []
  let maxD2 = []
  let minD2 = []
  let maxL14 = []
  let minL14 = []
  let maxL13 = []
  let minL13 = []
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
      const { l5, l4, d4, l3, d3, l2, d2, l1 } = directionZeroMode
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
      else if (l1 === 4) maxL14.push(point)
      else if (l1 === 3) maxL13.push(point)
      else maxOtherNoMatter.push(point)
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
      const { l5, l4, d4, l3, d3, l2, d2, l1 } = minDirectionZeroMode
      // console.log({ allMode, directionZeroMode, directionOneMode, directionTwoMode, directionThreeMode })
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
      else if (l1 === 4) minL14.push(point)
      else if (l1 === 3) minL13.push(point)
      else minOtherNoMatter.push(point)
      minScore = calcEvaPointScore(minDirectionZeroMode)
    }

    // 无论 max 还是 min, 都是考虑 maxScore + minScore, 原理是: 无论我方还是对方能在此获得较大分数, 都应抢占这个地方
    // pointsWithScore.push({ position: [i, j], score: maxScore + minScore })
    pointsWithScore.push({ position: [i, j], score: maxScore * this.attackFactor + minScore * this.defenseFactor })
  }

  let rst
  if (isMax) {
    if (kill) {
      // 算杀只考虑 max 方连续进攻, min 方不需要判断算杀
      if (maxL5.length) return maxL5
      if (minL5.length) return []
      if (maxL4.length) return maxL4
      if (maxD4L3.length || maxD4.length) return maxD4L3.concat(maxD4)
      if (minL4.length || minD4.length) return []
      // 双三可以考虑一下, 考虑活三性能会很差
      // 如果考虑三, 搜索时, min 方的启发函数不应剪切棋子, 否则算杀有概率失误
      if (maxDoubleL3.length) return maxDoubleL3
      if (maxL3.length) return maxL3
      return []
    }
    // console.log({ kill, role, maxL5, minL5, maxL4, maxD4L3, minL4, minD4L3, maxDoubleL3, minDoubleL3 })
    if (maxL5.length) return maxL5
    if (minL5.length) return minL5
    if (maxL4.length) return maxL4
    if (minL4.length) return minL4

    // !! 这里的顺序和选子很重要, 影响棋力和剪枝效率, 最好和评估函数保持一致
    rst = maxD4L3
      .concat(minD4L3)
      .concat(maxDoubleL3)
      .concat(minDoubleL3)
      .concat(maxMoreL2)
      .concat(minMoreL2)
      .concat(maxL3)
      .concat(minL3)
      .concat(maxDoubleL2)
      .concat(minDoubleL2)
      .concat(maxD4)
      .concat(minD4)
      .concat(maxD3)
      .concat(minD3)
      .concat(maxL2)
      .concat(minL2)
      .concat(maxL14)
      .concat(maxL13)
      .concat(maxD2)
      .concat(minD2)
      .concat(maxOtherNoMatter)
  } else {
    if (minL5.length) return minL5
    if (maxL5.length) return maxL5
    if (minL4.length) return minL4
    if (maxL4.length) return maxL4
    // !! 这里的顺序和选子很重要, 影响棋力和剪枝效率, 最好和评估函数保持一致
    rst = minD4L3
      .concat(maxD4L3)
      .concat(minDoubleL3)
      .concat(maxDoubleL3)
      .concat(minMoreL2)
      .concat(maxMoreL2)
      .concat(minL3)
      .concat(maxL3)
      .concat(minDoubleL2)
      .concat(maxDoubleL2)
      .concat(minD4)
      .concat(maxD4)
      .concat(minD3)
      .concat(maxD3)
      .concat(minL2)
      .concat(maxL2)
      .concat(minL14)
      .concat(minL13)
      .concat(minD2)
      .concat(maxD2)
      .concat(minOtherNoMatter)
  }

  // console.log({ rst })
  rst = pointsWithScore.sort((a, b) => b.score - a.score).map((x) => x.position)

  if (rst.length <= this.genLimit) return rst
  return rst.slice(0, this.genLimit)
}
