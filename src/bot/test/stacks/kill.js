import { MAX, MIN } from '../../const'

const kill0 = {
  firstHand: MAX,
  isKill: true,
  stack: [
    [7, 7],
    [8, 8],
    [6, 8],
    [5, 9],
    [7, 9],
    [7, 8],
    [5, 7],
    [8, 10],
    [4, 6],
    [3, 5],
    [4, 7],
    [6, 7],
    [4, 5],
    [4, 4],
    [6, 6],
    [4, 9],
    [5, 6],
    [3, 6],
  ],
}

const kill1 = {
  firstHand: MAX,
  isKill: true,
  stack: [
    [7, 7],
    [8, 8],
    [9, 8],
    [10, 7],
    [8, 7],
    [10, 9],
    [6, 7],
    [5, 7],
    [7, 6],
    [10, 6],
    [10, 8],
    [7, 9],
    [9, 7],
    [6, 8],
    [8, 10],
    [4, 6],
    [3, 5],
    [9, 9],
    [11, 9],
    [8, 6],
  ],
}

const kill2 = {
  firstHand: MIN,
  isKill: false,
  stack: [
    [10, 5],
    [7, 7],
    [9, 4],
    [7, 6],
    [11, 6],
    [8, 3],
    [12, 7],
    [13, 8],
    [7, 5],
    [8, 6],
    [9, 6],
    [9, 5],
    [10, 4],
    [8, 4],
    [8, 5],
    [10, 6],
    [11, 7],
    [7, 3],
    [6, 2],
    [6, 3],
    [9, 3],
    [4, 3],
    [5, 3],
    [6, 8],
    [5, 9],
  ],
}

export default [kill0, kill1, kill2]
