import { useEffect } from 'react'
import { useState } from 'react'
import { max, min, blank } from './bot/const'
import { arrayN } from './bot/support'
import { boardLength } from './bot/const'
import { isBoardFull, theWinner, minimax } from './bot/minimax'
import './App.css'

const Square = ({ value, onClick }) => {
  const show = (value) => ({ [max]: 'X', [min]: 'O' }[value])
  return (
    <button className="square" onClick={onClick}>
      {show(value)}
    </button>
  )
}

const Board = ({ squares, onClick }) => {
  return arrayN(boardLength).map((_, i) => (
    <div key={i} className="board-row">
      {arrayN(boardLength).map((_, j) => (
        <Square key={j} value={squares[i][j]} onClick={() => onClick(i, j)} />
      ))}
    </div>
  ))
}

const Game = () => {
  const [isBotStep, isBotStepX] = useState(false)
  const [winner, winnerX] = useState(null)
  const [draw, drawX] = useState(false)
  const isGameOver = !!winner || draw
  const [squares, squaresX] = useState(arrayN(boardLength).map((_) => arrayN(boardLength, blank)))
  const onClickBoard = (i, j) => {
    if (isGameOver) return
    if (squares[i][j] !== blank) return
    squares[i][j] = min
    squaresX([...squares])
  }

  useEffect(() => {
    console.log(isBotStep)
    if (!isGameOver && isBotStep) {
      // boot play
      console.time('thinking')
      const score = minimax(
        squares.map((x) => [...x]),
        3
      )
      console.timeEnd('thinking')
      console.log({ score })
      const [i, j] = score[1]
      squares[i][j] = max
      squaresX((_) => [...squares])
    }
  }, [isBotStep])

  useEffect(() => {
    console.log(squares)
    const winner = theWinner(squares)
    console.log(winner, squares)
    if (winner) winnerX(winner === max ? 'bot' : 'human')
    else isBoardFull(squares) && drawX(true)
    isBotStepX(!isBotStep)
  }, [squares])

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={squares} onClick={onClickBoard} />
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
