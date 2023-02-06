import { useEffect } from 'react'
import { useState } from 'react'
import { boardLength } from './bot/const'
import { arrayN, debounce } from './bot/support'
import { Gobang } from './bot/minimax'
import './App.css'
import './bot/otherFivechess'
import { Chessboard } from './bot/otherFivechess'
import { useReducer } from 'react'

var chessboard = new Chessboard(boardLength, boardLength)

let gobang = new Gobang({ boardLength })

const Square = ({ position, value, onClick, className }) => {
  const stackIndex = gobang.stack.findIndex((x) => x[0] === position[0] && x[1] === position[1])
  return (
    <button className={`square ${className}`} onClick={onClick}>
      <div className="square-line"></div>
      <div className="square-line rotate90"></div>
      {value !== Gobang.empty && (
        <div className={`chess chess-${value === gobang.firstHand ? 'black' : 'white'}`}>{stackIndex + 1 || null}</div>
      )}
    </button>
  )
}

const Board = ({ squares, onClick }) => {
  const lastChess = gobang.lastChessPosition
  return (
    <div>
      {arrayN(boardLength).map((_, i) => (
        <div key={i} className="board-row">
          {arrayN(boardLength).map((_, j) => (
            <Square
              key={j}
              position={[i, j]}
              value={squares[i][j]}
              className={lastChess && lastChess[0] === i && lastChess[1] === j ? 'lastChess' : null}
              onClick={() => onClick(i, j)}
            />
          ))}
        </div>
      ))}
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

    console.time('b1')
    var res = Chessboard.prototype.min(chessboard, 2)
    console.timeEnd('b1')
    chessboard.put(res.row, res.column, Chessboard.MIN)
    const done = gobang.minGo(res.row, res.column)
    // const done = gobang.minGo(i, j)
    console.log({ done })
    if (done) {
      forceUpdate()
      setTimeout(maxGo, 0)
    }
  }

  const maxGo = () => {
    const score = gobang.maxGo()
    forceUpdate()
    chessboard.put(score[1][0], score[1][1], Chessboard.MAX)
  }

  const onStart = () => {
    startX(true)
    gobang = new Gobang({ firstHand: Gobang.min })
    window.gobang = gobang
    chessboard = new Chessboard(boardLength, boardLength)
    if (gobang.firstHand === Gobang.max) maxGo()
    forceUpdate()
  }

  winner && console.log(`${winner === Gobang.max ? 'bot' : 'human'} 胜出`)

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={gobang.node} onClick={debounce(onClickBoard, 50)} />
      </div>
      <div className="opbtns">
        <button onClick={onStart}>{start ? '重来' : '开始'}</button>
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
        <div>{winner && `${winner === Gobang.max ? 'bot' : 'human'} 胜出`}</div>
        <div>{isDraw && '平局'}</div>
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  )
}

const App = Game

export default App
