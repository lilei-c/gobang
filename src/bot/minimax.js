/**
function minimax(node, depth)
    if node is a terminal node or depth = 0
        return the heuristic value of node
    if the adversary is to play at node
        let α := +∞
        foreach child of node
            α := min(α, minimax(child, depth-1))
    else {we are to play at node}
        let α := -∞
        foreach child of node
            α := max(α, minimax(child, depth-1))
    return α

heuristic adj.(教学或教育)启发式的
 */
import { max, min } from './const'
import { colToRow } from './support'
import { evaluate } from './evaluate.js'

const childs = (node) => {
  let rst = []
  for (let i in node)
    for (let j in node[i]) if (node[i][j] === null) rst.push([i, j])
  return rst
}

const childNode = (node, position, val) => {
  // console.log({ node, position, val })
  let rst = node.map((x) => [...x])
  rst[position[0]][position[1]] = val
  return rst
}

const theWinner = (node) => {
  // 行
  for (const m of node)
    if (m[0] !== null && m[0] === m[1] && m[0] == m[2]) return m[0]
  // 列
  for (const m of colToRow(node))
    if (m[0] !== null && m[0] === m[1] && m[0] == m[2]) return m[0]
  // 对角线
  if (
    node[0][0] !== null &&
    node[0][0] === node[1][1] &&
    node[0][0] === node[2][2]
  )
    return node[0][0]
  if (
    node[2][0] !== null &&
    node[2][0] === node[1][1] &&
    node[2][0] === node[0][2]
  )
    return node[2][0]
  return null
}

const isBoardFull = (node) => !node.some((x) => x.some((m) => m === null))

const isTerminalNode = (node) => theWinner(node) || isBoardFull(node)

const minimax = (
  node,
  depth,
  alpha = -Infinity,
  beta = Infinity,
  isMax = true
) => {
  // console.log('node', node)
  if (isTerminalNode(node) || depth === 0) return [evaluate(node), null]
  const allNextPosition = childs(node)
  if (isMax) {
    let val = -Infinity
    let nextPosition = allNextPosition && allNextPosition[0] // 即使所有评分都等于 -Infinity (必输局), 也要随便走一步
    for (const childPosition of allNextPosition) {
      // console.log(node, child, childNode(node, child, 1))
      const childVal = minimax(
        childNode(node, childPosition, max),
        depth - 1,
        alpha,
        beta,
        !isMax
      )[0]
      if (childVal > val) {
        val = childVal
        nextPosition = childPosition
      }
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
      // console.log('max', val, nextPosition, childNode(node, nextPosition, 1))
    }
    // console.log('max', val, nextPosition)
    return [val, nextPosition]
  } else {
    let val = Infinity
    let nextPosition = allNextPosition && allNextPosition[0]
    for (const childPosition of allNextPosition) {
      const childVal = minimax(
        childNode(node, childPosition, min),
        depth - 1,
        alpha,
        beta,
        !isMax
      )[0]
      // console.log('min', childVal, child, childNode(node, child, 0))
      if (childVal < val) {
        val = childVal
        nextPosition = childPosition
      }
      beta = Math.min(beta, val)
      if (beta <= alpha) break
    }
    // console.log('min', val, nextPosition)
    return [val, nextPosition]
  }
}

export { theWinner, isBoardFull, minimax }
