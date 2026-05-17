import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './GeometricBg.css'

const BG_COLOR = 0xffffff
const FOG_COLOR = 0xffffff

const PALETTE = [
  0x1a1a2e,
  0x2d3748,
  0x4a5568,
  0x6366f1,
  0x8899aa,
  0x3d3d5c,
]

function rnd(a, b) {
  return Math.random() * (b - a) + a
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function edgeMat(color, opacity = 1) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  })
}

function makeEdges(geo, color, opacity) {
  const edges = new THREE.EdgesGeometry(geo)
  return new THREE.LineSegments(edges, edgeMat(color, opacity))
}

class GeoShape {
  constructor(scene) {
    this.group = new THREE.Group()
    const color = pick(PALETTE)
    const opacity = rnd(0.12, 0.45)
    const type = Math.floor(rnd(0, 7))
    const s = rnd(0.5, 2.8)
    let geo

    if (type === 0) geo = new THREE.OctahedronGeometry(s, 0)
    else if (type === 1) geo = new THREE.IcosahedronGeometry(s, 0)
    else if (type === 2) geo = new THREE.TetrahedronGeometry(s, 0)
    else if (type === 3) geo = new THREE.BoxGeometry(s, s, s)
    else if (type === 4) geo = new THREE.DodecahedronGeometry(s, 0)
    else if (type === 5) geo = new THREE.CylinderGeometry(s * 0.6, s * 0.6, s * 1.4, 6, 1)
    else geo = new THREE.ConeGeometry(s * 0.8, s * 1.6, 5, 1)

    this.group.add(makeEdges(geo, color, opacity))

    if (Math.random() > 0.55) {
      const innerMesh = makeEdges(geo.clone(), color, opacity * 0.35)
      innerMesh.scale.setScalar(0.6)
      this.group.add(innerMesh)
    }

    this.group.position.set(rnd(-22, 22), rnd(-14, 14), rnd(-18, 8))
    this.group.rotation.set(rnd(0, Math.PI * 2), rnd(0, Math.PI * 2), rnd(0, Math.PI * 2))

    this.vRot = new THREE.Vector3(rnd(-0.003, 0.003), rnd(-0.004, 0.004), rnd(-0.002, 0.002))
    this.originY = this.group.position.y
    this.floatAmp = rnd(0.3, 1.2)
    this.floatSpeed = rnd(0.3, 1.0)
    this.floatOffset = rnd(0, Math.PI * 2)

    scene.add(this.group)
  }

  update(t) {
    this.group.rotation.x += this.vRot.x
    this.group.rotation.y += this.vRot.y
    this.group.rotation.z += this.vRot.z
    this.group.position.y = this.originY + Math.sin(t * this.floatSpeed + this.floatOffset) * this.floatAmp
  }
}

export default function GeometricBg() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth || window.innerWidth
    const H = mount.clientHeight || window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(BG_COLOR, 1)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(FOG_COLOR, 0.018)

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.set(0, 0, 28)

    const shapes = []
    for (let i = 0; i < 55; i++) shapes.push(new GeoShape(scene))

    const particleCount = 320
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = rnd(-25, 25)
      pPos[i * 3 + 1] = rnd(-16, 16)
      pPos[i * 3 + 2] = rnd(-20, 5)
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x8899aa,
      size: 0.06,
      transparent: true,
      opacity: 0.35,
    })))

    const clock = new THREE.Clock()
    let frameId

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      shapes.forEach((s) => s.update(t))
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="geometric-bg" aria-hidden />
}
