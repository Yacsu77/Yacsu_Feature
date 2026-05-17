import bgGif from '@background/Animation Relaxing GIF by Raz.gif'
import './BackgroundGif.css'

export default function BackgroundGif() {
  return (
    <div
      className="bg-gif"
      style={{ backgroundImage: `url(${bgGif})` }}
      aria-hidden
    ></div>
  )
}
