import { blank, max, min } from './const'
import { theModesDeepMap, theModesDeepArr } from './generateModes'
import { theIndexArray } from './generateIndexArray'

const dead2 = 2
const dead3 = 5
const dead4 = 10
const live2 = 20
const live3 = 100
const live4 = 10000
const final5 = 50000
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
console.log({ theModesDeepMap, theIndexArray })
const evaluate = (node) => {
  // console.log({ node })
  let modes = theIndexArray.map((x) => {
    return x.map((position) => node[position[0]][position[1]])
  })
  // console.log({ ...modes })
  modes = modes.map((x) => {
    // window.x = x
    window.theModesDeepMap = theModesDeepMap
    const x0 = x[0]
    const x1 = x[1]
    const x2 = x[2]
    const x3 = x[3]
    const x4 = x[4]
    const x5 = x[5]
    // window.test = () =>
    //   theModesDeepMap
    //     .get(x0)
    //     .get(x1)
    //     .get(x2)
    //     .get(x3)
    //     .get(x4)
    //     .get(x5 || blank)
    // // theModesDeepMap[x[0]][x[1]][x[2]][x[3]][x[4]][x[5] || blank]
    // var aa = window.test()
    const rst1 = theModesDeepArr[x0][x1][x2][x3][x4][x5 || blank]
    // const rst2 = theModesDeepMap
    //   .get(x0)
    //   .get(x1)
    //   .get(x2)
    //   .get(x3)
    //   .get(x4)
    //   .get(x5 || blank)
    return rst1
  })
  // console.log({ modes, theIndexArray })

  let rst = 0
  // 基础分数
  modes
    .filter((x) => !!x)
    .forEach((x) => {
      // const aa = theModesDeepMap[x[0]][x[1]][x[2]][x[3]][x[4]][x[5] || blank]
      rst += modeScores[x]
    })
  // 双3
  // 双4
  return rst
}

export { evaluate }
