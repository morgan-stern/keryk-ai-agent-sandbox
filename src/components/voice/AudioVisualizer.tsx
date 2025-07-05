'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  audioLevel?: number
  type?: 'input' | 'output'
}

export function AudioVisualizer({ isActive, audioLevel = 0, type = 'input' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize bars
    const barCount = 20
    if (barsRef.current.length === 0) {
      barsRef.current = new Array(barCount).fill(0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / barCount
      const gap = 2
      const maxHeight = canvas.height * 0.8

      // Update bars based on audio level and activity
      barsRef.current = barsRef.current.map((bar, i) => {
        if (isActive) {
          // Create wave effect
          const waveOffset = Math.sin(Date.now() * 0.003 + i * 0.5) * 0.3
          const targetHeight = audioLevel * (0.5 + waveOffset + Math.random() * 0.2)
          return bar + (targetHeight - bar) * 0.2
        } else {
          // Fade out when not active
          return bar * 0.9
        }
      })

      // Draw bars
      barsRef.current.forEach((barHeight, i) => {
        const height = barHeight * maxHeight
        const x = i * barWidth + gap / 2
        const y = (canvas.height - height) / 2

        // Gradient based on type
        const gradient = ctx.createLinearGradient(0, y, 0, y + height)
        if (type === 'input') {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)') // Blue for input
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)')
        } else {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)') // Green for output
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)')
        }

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - gap, height)
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, audioLevel, type])

  return (
    <div className="relative w-full h-16 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={64}
        className="w-full max-w-[300px] h-full"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-text-muted">
            {type === 'input' ? 'No audio input' : 'Silent'}
          </p>
        </div>
      )}
    </div>
  )
}