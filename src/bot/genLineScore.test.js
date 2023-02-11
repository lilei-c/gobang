import { expect, test } from 'vitest'
import { ninePointMode, chessModeBit } from './genLineScore'
const { l1, d2, l2, l2x2, d3, l3, d4, l4, l5 } = chessModeBit

const toBits = (x) => +('0b1' + x)
test.each(['11111', '111111', '111110', '011111', '0111110'])('ninePointMode l5 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(l5)
})
test.each(['011110', '0011110', '1011101', '010111010'])('ninePointMode l4 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(l4)
})
test.each(['111101111', '0101110', '111100', '11011'])('ninePointMode d4 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(d4)
})
test.each(['001110', '010110', '1010101'])('ninePointMode l3 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(l3)
})
test.each(['11100', '11010', '10110'])('ninePointMode d3 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(d3)
})
test.each(['011000', '010100', '001100'])('ninePointMode l2 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(l2)
})
test.each(['01100', '11000', '00011', '10100'])('ninePointMode d2 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(d2)
})
// 双活二
test.each(['0101010', '001010100', '0001010100', '0010101000', '00010101000', '00101010', '01010100'])(
  'ninePointMode l2x2 %s',
  (a) => {
    expect(ninePointMode[toBits(a)]).toEqual(l2x2)
  }
)
test.each(['010000', '001000', '1000010', '00001000', '1000010'])('ninePointMode l1 %s', (a) => {
  expect(ninePointMode[toBits(a)]).toEqual(l1)
})
