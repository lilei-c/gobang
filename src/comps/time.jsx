import { useEffect } from 'react'
import { useState } from 'react'

export default () => {
  const [time, timeX] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      timeX((x) => x + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <div className="">{time.toFixed(1)}</div>
}
