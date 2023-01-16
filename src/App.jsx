import { useEffect } from 'react'
import { useState } from 'react'
import { max, min, blank, boardLength } from './bot/const'
import { arrayN } from './bot/support'
import { Gobang } from './bot/minimax'
import './App.css'

const gobang = new Gobang({ boardLength })
const thinkingDepth = 3

const Square = ({ value, onClick }) => {
  const show = (value) => ({ [max]: '●', [min]: '○' }[value])
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
  console.log(gobang)
  const [isBotStep, isBotStepX] = useState(false)
  const [winner, winnerX] = useState(null)
  const [draw, drawX] = useState(false)
  const isGameOver = !!winner || draw

  const getWinner = () => {
    const winner = gobang.theWinner
    if (winner) winnerX(winner === max ? 'bot' : 'human')
    else if (gobang.isBoardFull) drawX(true)
    return winner
  }

  const onClickBoard = (i, j) => {
    if (isGameOver) return
    if (gobang.node[i][j] !== blank) return
    gobang.put([i, j], min)
    isBotStepX(true)
  }

  useEffect(() => {
    if (getWinner()) return
    if (!winner && !isGameOver && isBotStep) {
      // boot play
      console.time('thinking')
      const score = gobang.minimax(thinkingDepth)
      console.timeEnd('thinking')
      console.log({ score })
      gobang.put(score[1], max)
      isBotStepX(false)
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
