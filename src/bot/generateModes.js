/**
 * 还有一些 眠2 眠3 没有算进去
 *
 * 部分规则介绍
 * https://baijiahao.baidu.com/s?id=1716036313199600725&wfr=spider&for=pc
 */

import { max, min } from './const.js'

const generateAllModes = (arr = [[]], deep = 5) => {
  let rst = []
  for (const last of arr)
    for (const item of ['x', '-', 'o']) rst.push([...last, item])
  if (deep == 0) return rst
  return generateAllModes(rst, deep - 1)
}

const allModes = generateAllModes()
  .map((x) => x.join(''))
  .sort()

const isDead2 = (x) =>
  RegExp(`^ox-{0,2}x-*$`).test(x) ||
  /^-*x-{0,2}xo$/.test(x) ||
  /^-*x-{3}x-*$/.test(x) ||
  /^xx-*$/.test(x) ||
  /^-*xx$/.test(x)
const isLive2 = (x) => /^-+x-{0,1}x-+$/.test(x)
const isDead3 = (x) =>
  /^o-*x-*x-*x-*$/.test(x) ||
  /^-*x-*x-*x-*o$/.test(x) ||
  /^xxx-*$/.test(x) ||
  /^-*xxx$/.test(x)
const isLive3 = (x) => /^-+x-*x-*x-+$/.test(x)
const isDead4 = (x) =>
  /^o-*x-*x-*x-*x-*$/.test(x) ||
  /^-*x-*x-*x-*x-*o$/.test(x) ||
  /^xxxx-*$/.test(x) ||
  /^-*xxxx$/.test(x)
const isLive4 = (x) => /^-+x-*x-*x-*x-+$/.test(x)
const isFinal5 = (x) => /xxxxx/.test(x)

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
maxModes['xxxxx'] = 'final5'

// 替换属性名
let theModes = {}
for (const i in maxModes) {
  const newProp = i.replaceAll('x', max).replaceAll('o', min)
  theModes[newProp] = maxModes[i]
}

// min 方
for (const i in maxModes) {
  const newProp = i.replaceAll('o', max).replaceAll('x', min)
  theModes[newProp] = '-' + maxModes[i]
}

export { theModes }

console.log(theModes)
