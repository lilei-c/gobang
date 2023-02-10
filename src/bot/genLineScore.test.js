import { expect, test } from 'vitest'
import { ninePointScore, d2, l2, d3, l3, d4, l4, l5 } from './genLineScore'

const toBits = (x) => +('0b1' + x)
test.each(['11111', '111111', '111110', '011111', '0111110'])('ninePointScore l5 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(l5)
})
test.each(['011110', '0011110', '1011101'])('ninePointScore l4 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(l4)
})
test.each(['0101110', '111100', '11011'])('ninePointScore d4 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(d4)
})
test.each(['001110', '010110', '1010101'])('ninePointScore l3 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(l3)
})
test.each(['11100', '11010', '10110'])('ninePointScore d3 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(d3)
})
test.each(['011000', '010100', '001100'])('ninePointScore l2 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(l2)
})
test.each(['01100', '11000', '00011', '10100'])('ninePointScore d2 %s', (a) => {
  expect(ninePointScore[toBits(a)]).toEqual(d2)
})
