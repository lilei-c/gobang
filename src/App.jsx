import { useState } from 'react'
import { boardLength } from './bot/const'
import { debounce, range0 } from './bot/support'
import { Gobang } from './bot/gobang'
import './App.less'
import { useReducer } from 'react'
import Num from './comps/num'
import ABC from './comps/abc'
import Time from './comps/time'
import { useEffect } from 'react'
import Worker from './bot/worker.js?worker'
import { Music } from './comps/music/music'

let gobang = new Gobang()
let worker = new Worker()
// 方便调试
// test('console.log(this.node)')
window.test = (x) => worker.postMessage({ type: 'test', data: x })

const Square = ({ position, value, onClick, isLastChess, isMarkPoint, isWinnerPoint }) => {
  const stackIndex = gobang.stack.findIndex((x) => x[0] === position[0] && x[1] === position[1])
  return (
    <button className={`square ${isLastChess && 'lastChess'}`} onClick={onClick}>
      {value !== Gobang.EMPTY && (
        <div
          className={['chess', value === gobang.firstHand ? 'black' : 'white', isWinnerPoint ? 'pulse' : ''].join(' ')}
        >
          {stackIndex + 1 || null}
        </div>
      )}
      {isMarkPoint && <div className="markPoint"></div>}
    </button>
  )
}

const Board = ({ squares, onClick }) => {
  const lastChess = gobang.lastChessPosition
  const winner = gobang.winner
  const winnerPositions = winner ? gobang.winnerPositions : null

  return (
    <div className="boardCenter">
      <div className="rowLines">
        {range0(boardLength).map((x) => (
          <div key={x} className="item" />
        ))}
      </div>
      <div className="colLines">
        {range0(boardLength).map((x) => (
          <div key={x} className="item" />
        ))}
      </div>
      <div className="chesses">
        {range0(boardLength).map((i) => (
          <div key={i} className="boardRow">
            {range0(boardLength).map((j) => (
              <Square
                key={j}
                position={[i, j]}
                value={squares[i][j]}
                isLastChess={lastChess && lastChess[0] === i && lastChess[1] === j}
                isWinnerPoint={winnerPositions && winnerPositions.some(([pi, pj]) => pi === i && pj === j)}
                isMarkPoint={
                  (i === 3 && j === 3) ||
                  (i === 3 && j === 11) ||
                  (i === 7 && j === 7) ||
                  (i === 11 && j === 3) ||
                  (i === 11 && j === 11)
                }
                onClick={() => onClick(i, j)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="gameoverTip">
        {gobang.isDraw && <div className="tip">和棋~</div>}
        {winner && <div className="tip">{winner === gobang.firstHand ? '黑方胜' : '白方胜'}</div>}
      </div>
    </div>
  )
}

const Game = () => {
  const [start, startX] = useState(false)
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const [thinking, thinkingX] = useState(false)
  const [autoPlay, autoPlayX] = useState(false)
  const [musics, dispatchMusic] = useReducer((state, action) => {
    const { type, value, id } = action
    if (type === 'add') return [...state, { id: +new Date(), value }]
    else if (type === 'remove') return state.filter((m) => m.id !== id)
    else return []
  }, [])
  const isFinal = gobang.isFinal

  const onClickBoard = (i, j) => {
    // console.log({ start, isFinal, thinking })
    if (!start) return console.log({ start })
    if (isFinal) return console.log({ isFinal })
    if (thinking) return console.log({ thinking })
    if (autoPlay) return console.log({ autoPlay })
    worker.postMessage({ type: 'minGo', data: [i, j] })
  }

  const maxGo = () => {
    thinkingX(true)
    worker.postMessage({ type: 'maxGo' })
  }

  const onReStart = () => {
    worker.terminate()
    worker = new Worker()
    worker.postMessage({ type: 'init', data: {} })
    startX(false)
  }

  const onStart = (firstHand, autoPlay) => {
    startX(true)
    autoPlayX(autoPlay)
    worker.postMessage({ type: 'init', data: { firstHand, autoPlay, seekDepth: autoPlay ? 2 : 4 } })
  }

  const minRepent = () => {
    worker.postMessage({ type: 'minRepent' })
  }

  useEffect(() => {
    worker.onmessage = (e) => {
      const { type, gobang: gobangClone, data } = e.data
      gobang = JSON.parse(gobangClone)
      // console.log('message from worker', type, gobang, data)
      switch (type) {
        case 'init':
          if (gobang.firstHand === Gobang.MAX && !gobang.autoPlay) maxGo()
          else forceUpdate()
          break
        case 'minGo':
          if (data) {
            dispatchMusic({ type: 'add', value: 'fall' })
            maxGo()
          } else {
            // 禁止此处
          }
          break
        case 'maxGo':
          dispatchMusic({ type: 'add', value: 'fall' })
          thinkingX(false)
          break
        case 'autoPlay':
          dispatchMusic({ type: 'add', value: 'fall' })
          break
        default:
          break
      }
    }
  }, [worker])

  useEffect(() => {
    if (gobang.winner) dispatchMusic({ type: 'add', value: gobang.winner === Gobang.MAX ? 'fail' : 'win' })
  }, [gobang.winner])

  // console.log('update game')
  return (
    <div className="game">
      <Music musics={musics} onEnded={(x) => dispatchMusic({ type: 'remove', value: x })} />
      <div className="gameInfo">
        <Time />
        <div className=""></div>
      </div>
      <div className="gameBoard">
        <Num />
        <div className="center">
          <ABC />
          <Board squares={gobang.node} onClick={debounce(onClickBoard, 20)} />
          <ABC />
        </div>
        <Num />
      </div>
      <div className="opbtns">
        {start && <button onClick={onReStart}>重来</button>}
        {!start && <button onClick={() => onStart(Gobang.MAX)}>电脑先手</button>}
        {!start && <button onClick={() => onStart(Gobang.MIN)}>玩家先手</button>}
        {!start && <button onClick={() => onStart(Gobang.MAX, true)}>电脑vs电脑</button>}
        {start && (
          <button
            onClick={() => {
              minRepent()
            }}
          >
            {'悔棋'}
          </button>
        )}
      </div>
      <div className="game-info">
        {gobang.winner && <div>{gobang.winner === Gobang.MAX ? '少侠请努力' : '干得漂亮'}</div>}
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  )
}

const App = Game

export default App
