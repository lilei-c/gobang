import random from 'random'
import { arrayN } from './support'

class Zobrist {
  constructor({ size }) {
    // js 异或运算最多32位 // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR
    const maxRand = Math.pow(2, 30)
    this.max = arrayN(size).map((_) => arrayN(size).map(() => random.int(0, maxRand)))
    this.min = arrayN(size).map((_) => arrayN(size).map(() => random.int(0, maxRand)))
    this.code = random.int(0, maxRand)
    this.hash = {}
  }

  go(i, j, isMax) {
    this.code ^= isMax ? this.max[i][j] : this.min[i][j]
  }

  get() {
    return this.hash[this.code]
  }

  set(val) {
    // this.hash[this.code] = val
  }

  resetHash() {
    this.hash = {}
  }
}
export { Zobrist }
