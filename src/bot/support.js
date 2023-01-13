export const arrayN = (n, str = null) => Array(n).fill(str)
export const colToRow = (arr) =>
  arrayN(arr.length).map((_, i) => arrayN(arr.length).map((_, j) => arr[j][i]))
