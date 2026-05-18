import { useEffect, useRef, useState } from 'react'
import './AnimusHud.css'

const MESSAGES = [
  'Initializing Animus core...',
  'Calibrating DNA sequence...',
  'Loading memory blocks...',
  'Establishing neural link...',
  'Synchronizing ancestor data...',
  'Rendering Caribbean, 1715...',
  'Memory sequence ready.',
]

const SEQ_LABELS = ['LOADING', 'READING DNA', 'MAPPING', 'CALIBRATING', 'SYNCING', 'RENDERING', 'READY']

function rndHex(len) {
  let s = ''
  for (let i = 0; i < len; i++) s += '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
  return s
}

export default function AnimusHud() {
  const [pct, setPct] = useState(0)
  const [seqLabel, setSeqLabel] = useState('MEMORY SEQUENCE IV · LOADING')
  const [statusLines, setStatusLines] = useState([`> ${MESSAGES[0]}`])
  const [stats, setStats] = useState({
    dna: '--', nodes: '--', rate: '--', depth: '--',
    mem: '--', conn: '--', lat: '--', temp: '--',
  })
  const msgIdxRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPct((prev) => {
        const next = Math.min(100, prev + Math.random() * 3.5 + 0.5)
        const li = Math.min(Math.floor(next / 15), SEQ_LABELS.length - 1)
        setSeqLabel(`MEMORY SEQUENCE IV · ${SEQ_LABELS[li]}`)

        setStats({
          dna: '0x' + rndHex(6),
          nodes: String(Math.floor(next * 0.6 + 40)),
          rate: (30 + next * 0.7).toFixed(1) + 'Hz',
          depth: (next * 0.12).toFixed(2) + 'm',
          mem: String(Math.floor(next * 2.4)),
          conn: String(Math.floor(next * 1.8 + 30)),
          lat: String(Math.floor(Math.random() * 16 + 2)),
          temp: String(Math.floor(next * 0.97)),
        })

        if (next >= (msgIdxRef.current + 1) * 14 && msgIdxRef.current < MESSAGES.length - 1) {
          msgIdxRef.current += 1
          const msg = MESSAGES[msgIdxRef.current]
          setStatusLines((lines) => [...lines.slice(-3), `> ${msg}`])
        }

        if (next >= 100) clearInterval(interval)
        return next
      })
    }, 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="animus-hud">
      <div className="animus-hud__cluster">
        <div className="animus-hud__top">
          <div className="animus-hud__label">Abstergo Industries — Animus v4.3</div>
          <div className="animus-hud__seq">{seqLabel}</div>
        </div>

        <div className="animus-hud__sync-block">
          <svg className="animus-hud__logo" viewBox="0 0 72 72" fill="none" aria-hidden>
            <polygon points="36,6 66,58 6,58" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.8" />
            <polygon points="36,18 56,52 16,52" stroke="#c9a84c" strokeWidth="0.6" fill="none" opacity="0.4" />
            <line x1="36" y1="6" x2="36" y2="58" stroke="#c9a84c" strokeWidth="0.4" opacity="0.3" />
            <circle cx="36" cy="36" r="5" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.7" />
            <circle cx="36" cy="36" r="2" fill="#c9a84c" opacity="0.9" />
          </svg>
          <div className="animus-hud__pct">
            {Math.floor(pct)}<span>%</span>
          </div>
          <div className="animus-hud__sync-label">Synchronizing Memory</div>
          <div className="animus-hud__bar-wrap">
            <div className="animus-hud__bar-fill" style={{ width: `${pct}%` }} />
            <div className="animus-hud__bar-sweep" />
          </div>
        </div>
      </div>

      <div className="animus-hud__right">
        <div className="animus-hud__item"><b>{stats.mem}</b> memory blocks</div>
        <div className="animus-hud__item"><b>{stats.conn}</b> connections</div>
        <div className="animus-hud__item"><b>{stats.lat}</b> ms latency</div>
        <div className="animus-hud__item"><b>{stats.temp}</b>% coherence</div>
      </div>

      <div className="animus-hud__status">
        {statusLines.map((line, i) => (
          <div key={i} className="animus-hud__status-line">{line}</div>
        ))}
      </div>
    </div>
  )
}
