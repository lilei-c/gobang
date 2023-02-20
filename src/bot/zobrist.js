import random from 'random'
import { arrayN } from './support'

class Zobrist {
  constructor({ size, randFn }) {
    // js 异或运算最多32位 // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR
    if (!randFn) randFn = () => random.int(0, 2 ** 30)
    this.max = arrayN(size).map((_) => arrayN(size).map(randFn))
    this.min = arrayN(size).map((_) => arrayN(size).map(randFn))
    this.code = randFn()
    this.hash = {}
  }

  go(i, j, isMax) {
    this.code ^= isMax ? this.max[i][j] : this.min[i][j]
  }

  get() {
    return this.hash[this.code]
  }

  set(val) {
    this.hash[this.code] = val
  }

  resetHash() {
    this.hash = {}
  }
}
export { Zobrist }
