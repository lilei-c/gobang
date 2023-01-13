import { boardLength } from './const'

const generate = (boardLength) => {
  let rst = []
  // →
  for (let i = 0; i < boardLength; i++)
    for (let j = 0; j < boardLength; j++)
      if (j < boardLength - 5)
        rst.push([
          [i, j],
          [i, j + 1],
          [i, j + 2],
          [i, j + 3],
          [i, j + 4],
          [i, j + 5],
        ])
  // ↓
  for (let i = 0; i < boardLength; i++)
    for (let j = 0; j < boardLength; j++)
      if (i < boardLength - 5)
        rst.push([
          [i, j],
          [i + 1, j],
          [i + 2, j],
          [i + 3, j],
          [i + 4, j],
          [i + 5, j],
        ])
  // ↙
  for (let i = 0; i < boardLength; i++)
    for (let j = 0; j < boardLength; j++)
      if (j > 4 && i < boardLength - 5)
        rst.push([
          [i, j],
          [i + 1, j - 1],
          [i + 2, j - 2],
          [i + 3, j - 3],
          [i + 4, j - 4],
          [i + 5, j - 5],
        ])
  // ↘
  for (let i = 0; i < boardLength; i++)
    for (let j = 0; j < boardLength; j++)
      if (j < boardLength - 5 && i < boardLength - 5)
        rst.push([
          [i, j],
          [i + 1, j + 1],
          [i + 2, j + 2],
          [i + 3, j + 3],
          [i + 4, j + 4],
          [i + 5, j + 5],
        ])
  // 刚好 5 位的 4 个对角
  // top ↙
  rst.push([
    [0, 4],
    [1, 3],
    [2, 2],
    [3, 1],
    [4, 0],
  ])
  // top ↘
  rst.push([
    [0, boardLength - 5],
    [1, boardLength - 4],
    [2, boardLength - 3],
    [3, boardLength - 2],
    [4, boardLength - 1],
  ])
  // bottom ↘
  rst.push([
    [boardLength - 5, 0],
    [boardLength - 4, 1],
    [boardLength - 3, 2],
    [boardLength - 2, 3],
    [boardLength - 1, 4],
  ])
  // bottom ↙
  rst.push([
    [boardLength - 5, boardLength - 1],
    [boardLength - 4, boardLength - 2],
    [boardLength - 3, boardLength - 3],
    [boardLength - 2, boardLength - 4],
    [boardLength - 1, boardLength - 5],
  ])
  return rst
}

const theIndexArray = generate(boardLength)

export { theIndexArray }

console.log(theIndexArray.length)
console.log(theIndexArray)
