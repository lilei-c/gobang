var Socre = {
  dead2: 1,
  dead3: 10,
  live2: 800,
  dead4: 1000,
  live3: 2000,
  live4: 100000,
  live5: 1000000,
}
var countLine = (chess, block, wall) => (s) => {
  var r = 0b1
  for (let i = 0; i < s.length; i++) {
    const val = s[i]
    if (i < 4) {
      r <<= 1
      if (val === chess) r += 1
      else if (val === block || val === wall) {
        r = 0b1
      }
    } else if (i === 4) {
      r <<= 1
      r += 1 //console.log(r.toString(2))
    } else {
      if (val === block || val === wall) break
      r <<= 1
      if (val === chess) r += 1 //console.log(r.toString(2))
    }
  }
  return r
}
var generateAllModes = (arr = [[]], deep = 6) => {
  if (deep === 0) return arr
  let temp = []
  for (const last of arr) for (const item of [0, 1, 2]) temp.push([...last, item])
  return generateAllModes(temp, deep - 1)
}
var aa = generateAllModes([[]], 9)
  .filter((x) => x[4] == 1)
  .map(countLine(1, 2))
  .filter((x) => x.toString(2).match(/1/g)?.length > 2)
  .filter((x) => x.toString(2).length > 5)
  .sort()
  .map((x) => x.toString(2))

var obj = {}
aa.forEach((x) => (obj[x] = null))
var isDead2 = (x) => /10{0,1}1/.test(x)
var isDead3 = (x) => [/111/, /1011/, /1101/, /11001/, /10011/, /10101/].some((t) => t.test(x))
var isDead4 = (x) => [/1111/, /11011/, /11101/, /10111/].some((t) => t.test(x))
var isLive2 = (x) => /^0+10{0,1}10+$/.test(x) && x.length > 5
var isLive3 = (x) => [/010110/, /011010/, /01110/, /1010101/].some((t) => t.test(x))
var isLive4 = (x) => [/011110/, /1011101/, /11011011/, /111010111/].some((t) => t.test(x))
var is5 = (x) => /1{5}/.test(x)
var countLineSocre = []
aa.forEach((x) => isDead2(x.slice(1)) && (obj[x] = Socre.dead2) && (countLineSocre[+`0b${x}`] = Socre.dead2))
aa.forEach((x) => isDead3(x.slice(1)) && (obj[x] = Socre.dead3) && (countLineSocre[+`0b${x}`] = Socre.dead3))
aa.forEach((x) => isDead4(x.slice(1)) && (obj[x] = Socre.dead4) && (countLineSocre[+`0b${x}`] = Socre.dead4))
aa.forEach((x) => isLive2(x.slice(1)) && (obj[x] = Socre.live2) && (countLineSocre[+`0b${x}`] = Socre.live2))
aa.forEach((x) => isLive3(x.slice(1)) && (obj[x] = Socre.live3) && (countLineSocre[+`0b${x}`] = Socre.live3))
aa.forEach((x) => isLive4(x.slice(1)) && (obj[x] = Socre.live4) && (countLineSocre[+`0b${x}`] = Socre.live4))
aa.forEach((x) => is5(x.slice(1)) && (obj[x] = Socre.live5) && (countLineSocre[+`0b${x}`] = Socre.live5))
console.log(
  'no match',
  Object.keys(obj)
    .filter((x) => !obj[x])
    .map((x) => x.slice(1))
)
Object.keys(Socre).forEach((m) => {
  console.log(
    m,
    Object.keys(obj)
      .filter((x) => obj[x] === Socre[m])
      .map((x) => x.slice(1))
  )
})
console.log({ countLineSocre })

export { countLineSocre, Socre, countLine }
