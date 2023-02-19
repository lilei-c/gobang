import fall from './fall.mp3'
import win from './win.mp3'
import fail from './fail.mp3'
import draw from './draw.mp3'

const urls = {
  fall,
  win,
  fail,
  draw,
}

export const Music = ({ musics, onEnded }) => {
  return (
    <>
      {musics.map((x) => (
        <video src={urls[x.value]} key={x.id} onEnded={() => onEnded(x.id)} autoPlay hidden></video>
      ))}
    </>
  )
}
