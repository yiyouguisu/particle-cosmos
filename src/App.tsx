import { useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { ParticleField } from './particles/ParticleField'
import { useMouseTracking } from './hooks/useMouseTracking'
import { useStore } from './store/useStore'
import { audioEngine } from './audio/AudioEngine'
import { FORMATION_NAMES } from './particles/formations'
import './index.css'

export default function App() {
  useMouseTracking()

  const audioEnabled = useStore((s) => s.audioEnabled)
  const toggleAudio = useStore((s) => s.toggleAudio)
  const nextFormation = useStore((s) => s.nextFormation)
  const prevFormation = useStore((s) => s.prevFormation)
  const goToFormation = useStore((s) => s.goToFormation)
  const togglePause = useStore((s) => s.togglePause)
  const formation = useStore((s) => s.formation)
  const activeIndex = formation.morphProgress >= 1 ? formation.currentIndex : formation.targetIndex

  useEffect(() => {
    const events = ['mousemove', 'pointerdown', 'keydown', 'touchstart'] as const
    const initAudio = () => {
      audioEngine.init()
      audioEngine.setEnabled(useStore.getState().audioEnabled)
      for (const evt of events) {
        window.removeEventListener(evt, initAudio)
      }
    }
    for (const evt of events) {
      window.addEventListener(evt, initAudio, { passive: true })
    }
    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, initAudio)
      }
    }
  }, [])

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const formation = useStore.getState().formation
    switch (e.code) {
      case 'ArrowRight':
        if (formation.morphProgress >= 1) nextFormation()
        break
      case 'ArrowLeft':
        if (formation.morphProgress >= 1) prevFormation()
        break
      case 'Space':
        e.preventDefault()
        togglePause()
        break
    }
  }, [nextFormation, prevFormation, togglePause])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <ParticleField />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.1}
            mipmapBlur
          />
          <Vignette
            darkness={0.35}
            offset={0.3}
          />
        </EffectComposer>
      </Canvas>

      {/* Scene navigation */}
      <nav className="scene-nav">
        {FORMATION_NAMES.map((name, i) => (
          <div
            key={name}
            className={`scene-nav-item${i === activeIndex ? ' active' : ''}`}
            onClick={() => {
              if (formation.morphProgress >= 1) goToFormation(i)
            }}
          >
            <span className={`scene-nav-label${i === activeIndex ? ' active' : ''}`}>{name}</span>
            <span className={`scene-nav-dot${i === activeIndex ? ' active' : ''}`} />
          </div>
        ))}
      </nav>

      {/* Audio toggle */}
      <button
        className="audio-toggle"
        onClick={() => {
          audioEngine.init()
          toggleAudio()
          audioEngine.setEnabled(!audioEnabled)
        }}
      >
        {audioEnabled ? '\u{1F50A}' : '\u{1F507}'}
      </button>
    </div>
  )
}
