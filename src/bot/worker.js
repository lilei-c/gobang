import { MAX } from './const'
import { Gobang } from './gobang'

const gobang = new Gobang()

onmessage = function (e) {
  console.log(e.data)
  const { type, data } = e.data
  let res
  switch (type) {
    case 'init':
      gobang.init(data)
      if (data.firstHand === MAX) gobang.maxGo()
      break
    case 'maxGo':
      res = gobang.maxGo()
      break
    case 'minGo':
      res = gobang.minGo(...data)
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
