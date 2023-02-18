import { Gobang } from './gobang'
import { Chessboard } from './otherFivechess'
import { wait } from './support'
let gobang = new Gobang()

// 同步操作统一在函数末尾发送消息
// 异步操作在 switch 分支发送消息并 return
onmessage = async function (e) {
  // console.log(e.data)
  const { type, data } = e.data
  let res
  switch (type) {
    case 'init':
      gobang.init(data)
      if (gobang.autoPlay) {
        autoPlayWithOtherAI()
        // autoPlayWithSelf()
      }
      break
    case 'maxGo':
      res = gobang.maxGo()
      break
    case 'minGo':
      res = gobang.minGo(...data)
      break
    case 'minRepent':
      res = gobang.minRepent()
      break
    case 'reStart':
      res = gobang.init({})
      break
    case 'test':
      res = gobang.test(data)
      break
    default:
      break
  }
  senMessage(type, res)
}

const senMessage = (type, data) =>
  postMessage({
    type,
    data,
    gobang: JSON.stringify({
      ...gobang,
      node: gobang.node,
      stack: gobang.stack,
      firstHand: gobang.firstHand,
      lastChessPosition: gobang.lastChessPosition,
      winnerPositions: gobang.winnerPositions,
      isDraw: gobang.isDraw,
      winner: gobang.winner,
      isFinal: gobang.isFinal,
    }),
  })

// 和其它AI对弈, 方便测试
const autoPlayWithOtherAI = async () => {
  const otherBot = new Chessboard(15, 15)
  const gobangGo = async () => {
    if (gobang.isFinal) return
    const { i, j } = gobang.maxGo()
    otherBot.put(i, j, Chessboard.MIN)
    senMessage('autoPlay')
  }
  const otherGo = async () => {
    if (gobang.isFinal) return
    console.time('other AI')
    const { row, column } = Chessboard.prototype.max(otherBot, 2)
    console.timeEnd('other AI')
    otherBot.put(row, column, Chessboard.MAX)
    gobang.minGo(row, column)
    senMessage('autoPlay')
  }
  gobang.genLimit = 40
  gobang.seekDepth = 4
  while (gobang.autoPlay && !gobang.isFinal) {
    await gobangGo()
    await wait(50)
    await otherGo()
    await wait(50)
  }
}

const autoPlayWithSelf = async () => {
  const otherGobang = new Gobang({ firstHand: Gobang.MIN, seekDepth: 2, defenseFactor: 4 })
  gobang.genLimit = 40
  gobang.seekDepth = 4
  otherGobang.defenseFactor = 4
  otherGobang.genLimit = 40
  otherGobang.seekDepth = 4
  otherGobang.defenseFactor = 4
  const gobangGo = async () => {
    if (gobang.isFinal) return
    const { i, j } = gobang.maxGo()
    otherGobang.minGo(i, j)
    senMessage('autoPlay')
  }
  const otherGo = async () => {
    if (gobang.isFinal) return
    const { i: ii, j: jj } = otherGobang.maxGo()
    gobang.minGo(ii, jj)
    senMessage('autoPlay')
  }
  while (gobang.autoPlay && !gobang.isFinal) {
    await gobangGo()
    await wait(50)
    await otherGo()
    await wait(50)
  }
}
