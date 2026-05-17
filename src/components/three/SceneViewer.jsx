import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import modelUrl from '@models/alien_desert_succulent_ti1.glb'
import './SceneViewer.css'

export default function SceneViewer() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth  || 400
    const H = mount.clientHeight || 400

    // ── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene()

    // ── Camera ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.01, 1000)
    camera.position.set(0, 0.8, 4)

    // ── Renderer ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping      = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // ── Lights ─────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.8))

    const sun = new THREE.DirectionalLight(0xfff5d0, 3.5)
    sun.position.set(4, 9, 6)
    sun.castShadow = true
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xd0e8ff, 1.2)
    fill.position.set(-6, 2, -4)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xfff0c0, 0.8)
    rim.position.set(0, -3, -6)
    scene.add(rim)

    // ── Load GLB ───────────────────────────────────────────
    let group = null
    const loader = new GLTFLoader()

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene

        // Enable shadows on all meshes
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow    = true
            child.receiveShadow = true
          }
        })

        // Centre and normalise scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size   = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        model.position.sub(center)
        model.scale.setScalar(2.6 / maxDim)

        group = new THREE.Group()
        group.add(model)
        scene.add(group)
      },
      undefined,
      (err) => console.warn('[SceneViewer] GLB load error:', err),
    )

    // ── Animation loop ─────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      if (group) {
        group.rotation.y  = t * 0.28
        group.position.y  = Math.sin(t * 0.55) * 0.07
      }
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ─────────────────────────────────────────────
    const onResize = () => {
      const W = mount.clientWidth, H = mount.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="scene-viewer" />
}
