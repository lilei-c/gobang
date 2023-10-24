/**
  对于"引用类型", arrayN 使用 structuredClone 处理 val, 防止多个变量指向相同引用
 */
export const arrayN = (n, val) => {
  if (typeof val === 'object') {
    return Array(n)
      .fill()
      .map(() => structuredClone(val))
  }
  return Array(n).fill(val)
}

// export const colToRow = (arr) => arrayN(arr.length).map((_, i) => arrayN(arr.length).map((_, j) => arr[j][i]))

export const debounce = (fn, gap = 20) => {
  let now = +new Date()
  // console.warn({ now })
  return (...args) => {
    // console.warn(+new Date() - now)
    if (+new Date() - now > gap) fn(...args)
    now = +new Date()
  }
}

export const range = (start) => (end) =>
  Array(end - start)
    .fill(null)
    .map((_, i) => start + i)
export const range0 = range(0)

export const wait = (n) => new Promise((res) => setTimeout(res, n))
