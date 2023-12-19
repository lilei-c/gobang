import { Gobang } from './gobang'
import { GobangSimple } from './gobang_simple'
import { GobangMCTS } from './gobang_mcts'
import { Chessboard } from './otherFivechess'
import { wait } from './support'
let gobang = new Gobang()
console.log({ GobangMCTS })

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
        // autoPlayWithOtherAI()
        autoPlayWithSelf()
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
      res = gobang.init()
      break
    default:
      break
  }
  sendMessage(type, res)
}

const sendMessage = (type, data) =>
  postMessage({
    type,
    data,
    gobang: JSON.stringify({
      ...gobang,
      node: gobang.node,
      stack: gobang.stack,
      firstHand: gobang.firstHand,
      lastChessPosition: gobang.lastChessPosition,
      winnerPositions: gobang.winner ? gobang.winnerPositions : null,
      isDraw: gobang.isDraw,
      winner: gobang.winner,
      isFinal: gobang.isFinal,
    }),
  })

self.gobang = gobang // 仅仅测试用
self.sendMessage = sendMessage // 仅仅测试用

// 和其它AI对弈, 方便测试
const autoPlayWithOtherAI = async () => {
  const otherBot = new Chessboard(15, 15)
  const gobangGo = async () => {
    if (gobang.isFinal) return
    const { i, j } = gobang.maxGo()
    otherBot.put(i, j, Chessboard.MIN)
    sendMessage('autoPlay')
  }
  const otherGo = async () => {
    if (gobang.isFinal) return
    console.time('other AI')
    const { row, column } = Chessboard.prototype.max(otherBot, 2)
    console.timeEnd('other AI')
    otherBot.put(row, column, Chessboard.MAX)
    gobang.minGo(row, column)
    sendMessage('autoPlay')
  }
  const waitTime = 100
  while (gobang.autoPlay && !gobang.isFinal) {
    await otherGo()
    await wait(waitTime)
    await gobangGo()
    await wait(waitTime)
  }
}

const autoPlayWithSelf = async () => {
  // const otherGobang = new GobangSimple({ firstHand: Gobang.MIN })
  const otherGobang = new GobangMCTS({ firstHand: Gobang.MIN })

  gobang.genLimit = 30
  gobang.seekDepth = 8
  gobang.timeLimit = 20
  const gobangGo = async () => {
    if (gobang.isFinal) return
    const { i, j } = gobang.maxGo()
    otherGobang.minGo(i, j)
    sendMessage('autoPlay')
  }
  const otherGo = async () => {
    if (gobang.isFinal) return
    const { i, j } = otherGobang.maxGo()
    gobang.minGo(i, j)
    sendMessage('autoPlay')
  }
  const waitTime = 100
  while (gobang.autoPlay && !gobang.isFinal) {
    await gobangGo()
    await wait(waitTime)
    await otherGo()
    await wait(waitTime)
  }
}
