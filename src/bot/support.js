export const arrayN = (n) => Array(n).fill(null)
export const colToRow = (arr) =>
  arrayN(arr.length).map((_, i) => arrayN(arr.length).map((_, j) => arr[j][i]))
