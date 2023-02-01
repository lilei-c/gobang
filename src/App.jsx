import { useEffect } from 'react'
import { useState } from 'react'
import { max, min, blank, boardLength } from './bot/const'
import { arrayN } from './bot/support'
import { Gobang } from './bot/minimax'
import './App.css'
import './bot/otherFivechess'
import { Chessboard } from './bot/otherFivechess'

var chessboard = new Chessboard(15, 15)

const gobang = new Gobang({ boardLength })
console.log(gobang)
window.gobang = gobang

const Square = ({ value, onClick, className }) => {
  return (
    <button className={`square ${className}`} onClick={onClick}>
      <div className="square-line"></div>
      <div className="square-line rotate90"></div>
      {value === Gobang.max && <div className={`chess chess-black`}></div>}
      {value === Gobang.min && <div className={`chess chess-white`}></div>}
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
  const [isBotStep, isBotStepX] = useState(false)
  const [winner, winnerX] = useState(null)
  const [draw, drawX] = useState(false)
  const isGameOver = !!winner || draw

  const haveWinner = () => {
    const winner = gobang.theWinner()
    if (winner) winnerX(winner === max ? 'bot' : 'human')
    else if (gobang.isBoardFull) drawX(true)
    return winner
  }

  const onClickBoard = (i, j) => {
    if (isGameOver) return console.log({ isGameOver })
    if (isBotStep) return console.log({ isBotStep })
    if (gobang.node[i][j] !== blank) return
    isBotStepX(true)
    gobang.put([i, j], min)
    gobang.zobrist.resetHash()

    // console.time('b1')
    // var res = Chessboard.prototype.min(chessboard, 4)
    // console.timeEnd('b1')
    // chessboard.put(res.row, res.column, Chessboard.MIN)
    // gobang.put([res.row, res.column], min)

    haveWinner()
  }

  useEffect(() => {
    if (!winner && !isGameOver && isBotStep) {
      // boot play
      console.time('thinking')
      gobang.initABData()
      const score = gobang.minimax(Gobang.defaultDepth)
      gobang.logABData()
      console.timeEnd('thinking')
      console.log({ score })
      if (score && score[1]) {
        gobang.put(score[1], max)
        chessboard.put(score[1][0], score[1][1], Chessboard.MAX)
      }
      isBotStepX(false)
      haveWinner()
    }
  }, [isBotStep])

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={gobang.node} onClick={onClickBoard} />
      </div>
      <div className="game-info">
        <div>{isGameOver && 'game over'}</div>
        <div>{winner && `${winner} 胜出`}</div>
        <div>{draw && '平局'}</div>
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  )
}

const App = Game

export default App
