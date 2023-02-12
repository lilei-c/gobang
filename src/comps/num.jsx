import { boardLength } from '../bot/const'
import { range0 } from '../bot/support'
import './num.less'

export default () => (
  <div className="num">
    {range0(boardLength).map((i) => (
      <div key={i} className="item">
        {boardLength - i}
      </div>
    ))}
  </div>
)
