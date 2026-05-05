import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

const SMOOTHING_FACTOR = 0.3

export function useMouseTracking() {
  const setMousePosition = useStore((s) => s.setMousePosition)
  const animationFrameRef = useRef<number>(0)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const smoothUpdate = () => {
      const target = targetRef.current
      const current = currentRef.current

      current.x += (target.x - current.x) * SMOOTHING_FACTOR
      current.y += (target.y - current.y) * SMOOTHING_FACTOR

      setMousePosition(current.x, current.y)
      animationFrameRef.current = requestAnimationFrame(smoothUpdate)
    }

    animationFrameRef.current = requestAnimationFrame(smoothUpdate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [setMousePosition])
}
