import { useEffect } from 'react'
import { useState } from 'react'

export default () => {
  const [time, timeX] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      timeX((x) => x + 0.2)
    }, 200)
    return () => clearInterval(id)
  }, [])
  return <div className="">{time.toFixed(1)}</div>
}
