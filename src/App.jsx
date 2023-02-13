import { useState } from 'react'
import { boardLength } from './bot/const'
import { debounce, range0 } from './bot/support'
import { Gobang } from './bot/minimax'
import './App.less'
import './bot/otherFivechess'
import { Chessboard } from './bot/otherFivechess'
import { useReducer } from 'react'
import Num from './comps/num'
import ABC from './comps/abc'

var chessboard = new Chessboard(boardLength, boardLength)

let gobang = new Gobang({ boardLength })

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
  const winnerPositions = gobang.winner ? gobang.winnerPositions : null

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
    </div>
  )
}

const Game = () => {
  const [start, startX] = useState(false)
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const { winner, isFinal, isDraw } = gobang

  const onClickBoard = (i, j) => {
    if (!start) return console.log({ start })
    if (isFinal) return console.log({ isFinal })

    let minGo
    if (window.test) {
      console.time('b1')
      var res = Chessboard.prototype.min(chessboard, 2)
      console.timeEnd('b1')
      chessboard.put(res.row, res.column, Chessboard.MIN)
      minGo = gobang.minGo(res.row, res.column)
    } else {
      minGo = gobang.minGo(i, j)
    }
    if (minGo) {
      forceUpdate()
      setTimeout(maxGo, 0)
    }
  }

  const maxGo = () => {
    const score = gobang.maxGo()
    forceUpdate()
    const { i, j } = score
    chessboard.put(i, j, Chessboard.MAX)
  }

  const onReStart = () => {
    startX(false)
  }

  const onStart = (role) => {
    startX(true)
    gobang = new Gobang({ firstHand: role })
    window.gobang = gobang
    chessboard = new Chessboard(boardLength, boardLength)
    if (gobang.firstHand === Gobang.MAX) maxGo()
    forceUpdate()
  }

  winner && console.log(`${winner === Gobang.MAX ? 'bot' : 'human'} 胜出`)

  return (
    <div className="game">
      <div className="gameBoard">
        <Num />
        <div className="center">
          <ABC />
          <Board squares={gobang.node} onClick={debounce(onClickBoard, 50)} />
          <ABC />
        </div>
        <Num />
      </div>
      <div className="opbtns">
        {start && <button onClick={onReStart}>重来</button>}
        {!start && <button onClick={() => onStart(Gobang.MAX)}>开始 - 电脑先</button>}
        {!start && <button onClick={() => onStart(Gobang.MIN)}>开始 - 玩家先</button>}
        {start && (
          <button
            onClick={() => {
              gobang.minRepent()
              forceUpdate()
            }}
          >
            {'悔棋'}
          </button>
        )}
      </div>
      <div className="game-info">
        <div>{isFinal && 'game over'}</div>
        <div>{winner && `${winner === Gobang.MAX ? '少侠请努力' : '干得漂亮'}`}</div>
        <div>{isDraw && '和棋~'}</div>
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  )
}

const App = Game

export default App
