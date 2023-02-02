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
window.gobang = gobang

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
  const lastChess = gobang.stack.length ? gobang.stack[gobang.stack.length - 1] : null
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
  const winner = gobang.theWinner()
  const draw = !winner && gobang.isBoardFull
  const isGameOver = !!winner || draw

  const onClickBoard = (i, j) => {
    if (!start) return console.log({ start })
    if (isGameOver) return console.log({ isGameOver })

    // console.time('b1')
    // var res = Chessboard.prototype.min(chessboard, 2)
    // console.timeEnd('b1')
    // chessboard.put(res.row, res.column, Chessboard.MIN)
    // const done = gobang.minGo(res.row, res.column)
    const done = gobang.minGo(i, j)
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
    gobang = new Gobang({ boardLength })
    chessboard = new Chessboard(boardLength, boardLength)
    if (gobang.firstHand === Gobang.max) maxGo()
    forceUpdate()
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={gobang.node} onClick={debounce(onClickBoard)} />
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
        <div>{isGameOver && 'game over'}</div>
        <div>{winner && `${winner === Gobang.max ? 'bot' : 'human'} 胜出`}</div>
        <div>{draw && '平局'}</div>
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  )
}

const App = Game

export default App
