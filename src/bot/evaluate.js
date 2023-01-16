import { blank } from './const'
import { theModesDeepArr } from './generateModes'
import { theIndexArray } from './generateIndexArray'

const dead2 = 2
const dead3 = 5
const dead4 = 10
const live2 = 20
const live3 = 100
const live4 = 10000
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
  let modes = theIndexArray.map((x) => {
    return x.map((position) => node[position[0]][position[1]])
  })
  // console.log({ ...modes })
  modes = modes.map((x) => {
    const x0 = x[0]
    const x1 = x[1]
    const x2 = x[2]
    const x3 = x[3]
    const x4 = x[4]
    const x5 = x[5]
    return theModesDeepArr[x0][x1][x2][x3][x4][x5 || blank]
  })
  // console.log({ modes, theIndexArray })

  let rst = 0
  let moreLive2 = 0
  let moreLive3 = 0
  let moreLive4 = 0
  // 基础分数
  modes
    .filter((x) => !!x)
    .forEach((x) => {
      rst += modeScores[x]
      if (x === 'live2') moreLive2++
      if (x === 'live3') moreLive3++
      if (x === 'live4') moreLive4++
    })
  // 额外得分
  if (moreLive2 > 1) rst += live2 * 10
  if (moreLive3 > 1) rst += live3 * 100
  if (moreLive4 > 1) rst += live4 * 100
  return rst
}

export { evaluate }
