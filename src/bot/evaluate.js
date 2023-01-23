import { blank } from './const'
import { theModesDeepArr } from './generateModes'
import { theIndexArray } from './generateIndexArray'

const dead2 = 5
const dead3 = 10
const dead4 = 20
const live2 = 100
const live3 = 500
const live4 = 10000
const moreLive3 = 1000
const moreNeLive3 = -moreLive3
const live3AndDead4 = 2000
const neLive3AndNeDead4 = -live3AndDead4
const live3AndLive4 = 3000
const neLive3AndNeLive4 = -live3AndLive4
const final5 = Infinity
const modeScores = {
  dead2: dead2,
  dead3: dead3,
  dead4: dead4,
  live2: live2,
  live3: live3,
  live4: live4,
  final5: final5,
  '-dead2': -dead2,
  '-dead3': -dead3,
  '-dead4': -dead4,
  '-live2': -live2,
  '-live3': -live3,
  '-live4': -live4,
  '-final5': -final5,
}

console.log({ theIndexArray })
const evaluate = (node) => {
  // console.log({ node })
  const sixIndexToSixNodeVal = (x) => {
    const x0 = node[x[0][0]][x[0][1]]
    const x1 = node[x[1][0]][x[1][1]]
    const x2 = node[x[2][0]][x[2][1]]
    const x3 = node[x[3][0]][x[3][1]]
    const x4 = node[x[4][0]][x[4][1]]
    const x5 = node[x[5][0]][x[5][1]]
    // x5 可能为空 ?
    return {
      starting: x[0],
      // pValues: x.map((position) => node[position[0]][position[1]]),
      chessMode: theModesDeepArr[x0][x1][x2][x3][x4][x5 || blank],
    }
  }

  let rowNodeVals = theIndexArray.row.map((line) => line.map(sixIndexToSixNodeVal).filter((x) => !!x.chessMode))
  let colNodeVals = theIndexArray.col.map((line) => line.map(sixIndexToSixNodeVal).filter((x) => !!x.chessMode))
  let leftDownNodeVals = theIndexArray.leftDown.map((line) =>
    line.map(sixIndexToSixNodeVal).filter((x) => !!x.chessMode)
  )
  let rightDownNodeVals = theIndexArray.rightDown.map((line) =>
    line.map(sixIndexToSixNodeVal).filter((x) => !!x.chessMode)
  )
  // console.log({ ...modes })

  /**  现有匹配模式会出现重复统计的情况, 例如 0011100 会被统计成2个活三, 所以需要去除重 (不去重无法给双三增加额外分数, 本身也不准确),
   * 但经过思考会发现, `同一行`几乎不可能出现双三 (因为落子时优先形成活四而不是双活三, 所以双活三只能是被迫防守, 这还需要防守完成后,
   * 对方仍能持续四子进攻, 不然它就快要输了)
   *
   * 所以, 活三去重的简单办法就是 每一行只统计一次
   *
   * 活四: 不会重复
   * 冲四: 没细想, 但应该和活三差不多道理, 先直接去重
   * 死三, 活二, 四二: 权重不大, 暂不处理
   */
  let allChessMode = []
  const getChessMode = (line) => {
    let haveLive3 = false
    let haveNeLive3 = false
    let haveDead4 = false
    let haveNeDead4 = false
    line.forEach((sixPointVal) => {
      if (sixPointVal.chessMode === 'live3') {
        if (haveLive3) return
        haveLive3 = true
        return allChessMode.push(sixPointVal.chessMode)
      }
      if (sixPointVal.chessMode === '-live3') {
        if (haveNeLive3) return
        haveNeLive3 = true
        return allChessMode.push(sixPointVal.chessMode)
      }
      if (sixPointVal.chessMode === 'dead4') {
        if (haveDead4) return
        haveDead4 = true
        return allChessMode.push(sixPointVal.chessMode)
      }
      if (sixPointVal.chessMode === '-dead4') {
        if (haveNeDead4) return
        haveNeDead4 = true
        return allChessMode.push(sixPointVal.chessMode)
      }
      allChessMode.push(sixPointVal.chessMode)
    })
  }
  // console.log({ rowNodeVals, colNodeVals, leftDownNodeVals, rightDownNodeVals })
  rowNodeVals.forEach(getChessMode)
  colNodeVals.forEach(getChessMode)
  leftDownNodeVals.forEach(getChessMode)
  rightDownNodeVals.forEach(getChessMode)

  let rst = 0
  let live3Count = 0
  let neLive3Count = 0
  let dead4Count = 0
  let neDead4Count = 0
  let live4Count = 0
  let neLive4Count = 0
  allChessMode.forEach((x) => {
    rst += modeScores[x]
    if (x === 'live3') live3Count++
    if (x === '-live3') neLive3Count++
    if (x === 'dead4') dead4Count++
    if (x === '-dead4') neDead4Count++
    if (x === 'live4') live4Count++
    if (x === '-live4') neLive4Count++
  })

  // 额外得分
  if (live3Count > 1) rst += moreLive3
  if (neLive3Count > 1) rst += moreNeLive3
  if (live3Count > 0 && dead4Count > 0) rst += live3AndDead4
  if (neLive3Count > 0 && neDead4Count > 0) rst += neLive3AndNeDead4
  if (live3Count > 0 && live4Count > 0) rst += live3AndLive4
  if (neLive3Count > 0 && neLive4Count > 0) rst += neLive3AndNeLive4
  // console.log({
  //   rst,
  //   allChessMode,
  //   modeScores,
  //   rowNodeVals,
  //   node: structuredClone(node),
  // })
  return rst
}

export { evaluate }
