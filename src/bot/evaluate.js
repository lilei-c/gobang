import { max, min } from './const'
import { theModes } from './generateModes'
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
const evaluate = (node) => {
  // console.log({ node })
  let modes = theIndexArray.map((x) =>
    x.map((position) => node[position[0]][position[1]]).join('')
  )
  modes = modes.map((x) => theModes[x])
  console.log({ modes, theModes, theIndexArray })

  let rst = 0
  // 基础分数
  modes.forEach((m) => {
    if (m) {
      // console.log(m, modeScores[m])
      rst += modeScores[m]
    }
  })
  // 双3
  // 双4
  return rst
}

export { evaluate }
