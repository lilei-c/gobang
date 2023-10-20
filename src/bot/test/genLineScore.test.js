import { expect, test } from 'vitest'
import { serialPointMode, chessModeBit } from '../genLineScore'
const { l1, d2, l2, d3, l3, d4, l4, l5 } = chessModeBit

const toBits = (x) => +('0b1' + x)
test.each(['11111', '111111', '111110', '011111', '0111110'])('serialPointMode l5 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(l5)
})
test.each(['011110', '0011110', '1011101', '010111010'])('serialPointMode l4 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(l4)
})
test.each(['111101111', '0101110', '111100', '11011'])('serialPointMode d4 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(d4)
})
test.each(['001110', '010110', '1010101'])('serialPointMode l3 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(l3)
})
test.each(['11100', '11010', '10110', '0101010'])('serialPointMode d3 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(d3)
})
test.each(['011000', '010100', '001100'])('serialPointMode l2 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(l2)
})
test.each(['01100', '11000', '00011', '10100'])('serialPointMode d2 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(d2)
})
test.each(['010000', '001000', '1000010', '00001000', '1000010'])('serialPointMode l1 %s', (a) => {
  expect(serialPointMode[toBits(a)]).toEqual(l1)
})
test.each(['1111'])('serialPointMode d4 %s', (a) => {
  expect(serialPointMode[toBits(a)]).not.toBe(d4)
  expect(serialPointMode[toBits(a)]).not.toBe(d3)
})
