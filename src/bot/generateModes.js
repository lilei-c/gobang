/**
 * 还有一些 眠2 眠3 没有算进去
 *
 * 部分规则介绍
 * https://baijiahao.baidu.com/s?id=1716036313199600725&wfr=spider&for=pc
 */

import { max, min, blank } from './const.js'

const generateAllModes = (arr = [[]], deep = 6) => {
  if (deep === 0) return arr
  let temp = []
  for (const last of arr) for (const item of [max, min, blank]) temp.push([...last, item])
  return generateAllModes(temp, deep - 1)
}

const allModes = generateAllModes()
  .map((x) => x.join(''))
  .sort()

const isDead2 = (x) =>
  /^210{0,2}10*$/.test(x) || /^0*10{0,2}12$/.test(x) || /^0*10{3}10*$/.test(x) || /^110*$/.test(x) || /^0*11$/.test(x)
const isLive2 = (x) => /^0+10{0,1}10+$/.test(x)
const isDead3 = (x) => /^20*10*10*10*$/.test(x) || /^0*10*10*10*2$/.test(x) || /^1110*$/.test(x) || /^0*111$/.test(x)
const isLive3 = (x) => /^0+10*10*10+$/.test(x)
const isDead4 = (x) =>
  /^20*10*10*10*10*$/.test(x) || /^0*10*10*10*10*2$/.test(x) || /^10*10*10*10+$/.test(x) || /^0+10*10*10*1$/.test(x)
const isLive4 = (x) => /011110/.test(x)
const isFinal5 = (x) => /11111/.test(x)

const dead2 = allModes.filter(isDead2)
const live2 = allModes.filter(isLive2)
const dead3 = allModes.filter(isDead3)
const live3 = allModes.filter(isLive3)
const dead4 = allModes.filter(isDead4)
const live4 = allModes.filter(isLive4)
const final5 = allModes.filter(isFinal5)

console.log('dead2', dead2)
console.log('live2', live2)
console.log('dead3', dead3)
console.log('live3', live3)
console.log('dead4', dead4)
console.log('live4', live4)
console.log('final5', final5)

// max
const maxModes = {}
dead2.forEach((x) => (maxModes[x] = 'dead2'))
live2.forEach((x) => (maxModes[x] = 'live2'))
dead3.forEach((x) => (maxModes[x] = 'dead3'))
live3.forEach((x) => (maxModes[x] = 'live3'))
dead4.forEach((x) => (maxModes[x] = 'dead4'))
live4.forEach((x) => (maxModes[x] = 'live4'))
final5.forEach((x) => (maxModes[x] = 'final5'))

let theModes = {}
// max 方
for (const i in maxModes) {
  theModes[i] = maxModes[i]
}

// min 方
for (const i in maxModes) {
  const newProp = i.replaceAll(max, '$').replaceAll(min, max).replaceAll('$', min)
  theModes[newProp] = '-' + maxModes[i]
}

const generateDeepArr = (arr, deep = 6) => {
  if (deep === 0) return arr
  const upper = [structuredClone(arr) || 0, structuredClone(arr) || 0, structuredClone(arr) || 0]
  return generateDeepArr(upper, deep - 1)
}
let theModesDeepArr = generateDeepArr()
Object.keys(theModes).forEach((i) => {
  const i0 = +i[0]
  const i1 = +i[1]
  const i2 = +i[2]
  const i3 = +i[3]
  const i4 = +i[4]
  const i5 = +i[5]
  let ss = theModes[i]
  // console.log({ i, ss })
  theModesDeepArr[i0][i1][i2][i3][i4][i5] = ss
})

console.log({ theModes, theModesDeepArr })

export { theModesDeepArr }
