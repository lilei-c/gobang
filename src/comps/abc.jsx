import './abc.less'

export default () => (
  <div className="abc">
    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].map((x, i) => (
      <div key={x} className="item">
        {/* {x} */}
        {i}
      </div>
    ))}
  </div>
)
