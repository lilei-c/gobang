import { Gobang } from './gobang'
import { Chessboard } from './otherFivechess'
const gobang = new Gobang()

// 和其它AI对弈, 方便测试
let autoPlay = false
let otherBot = new Chessboard(15, 15)
function aiGo({ i, j }) {
  otherBot.put(i, j, Chessboard.MIN)
  console.time('b1')
  const otherStep = Chessboard.prototype.max(otherBot, 2)
  console.timeEnd('b1')
  otherBot.put(otherStep.row, otherStep.column, Chessboard.MAX)
  gobang.minGo(otherStep.row, otherStep.column)
  return true
}

onmessage = function (e) {
  // console.log(e.data)
  const { type, data } = e.data
  let res
  switch (type) {
    case 'init':
      gobang.init(data)
      autoPlay = data.autoPlay
      if (autoPlay) otherBot = new Chessboard(15, 15)
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
    case 'autoPlay':
      if (!autoPlay) return
      res = aiGo(data)
      break
    case 'test':
      res = gobang.test(data)
      break
    default:
      break
  }
  postMessage([
    type,
    JSON.stringify({
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
    res,
  ])
}
