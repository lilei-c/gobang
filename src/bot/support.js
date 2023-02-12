export const arrayN = (n, val = null) => Array(n).fill(val)

// export const colToRow = (arr) => arrayN(arr.length).map((_, i) => arrayN(arr.length).map((_, j) => arr[j][i]))

export const debounce = (fn, gap = 20) => {
  let now = +new Date()
  return (...args) => {
    if (+new Date() - now > gap) fn(...args)
    now = +new Date()
  }
}

export const range = (start) => (end) =>
  Array(end - start)
    .fill(null)
    .map((_, i) => start + i)
export const range0 = range(0)
