
'use client'

// CREDIT
// Component inspired by @BalintFerenczy on X
// https://codepen.io/BalintFerenczy/pen/KwdoyEN
import { useRef, useEffect } from 'react'

type ElectricBorderProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  color?: string
  speed?: number
  chaos?: number
  thickness?: number
}

export default function ElectricBorder({
  children,
  className,
  style,
  color = '#7df9ff',
  speed = 1,
  chaos = 0.5,
  thickness = 2,
}: ElectricBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = containerRef.current
    if (!container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let { width, height } = container.getBoundingClientRect()
    canvas.width = width
    canvas.height = height

    let path: { x: number; y: number }[] = []
    let lastSwitch = 0
    let switchInterval = 1000 / (speed * 10)

    const setup = () => {
      path = []
      const len = Math.floor(width)
      for (let i = 0; i <= len; i++) {
        path.push({ x: i, y: 0 })
      }
      for (let i = 0; i <= height; i++) {
        path.push({ x: len, y: i })
      }
      for (let i = len; i >= 0; i--) {
        path.push({ x: i, y: height })
      }
      for (let i = height; i >= 0; i--) {
        path.push({ x: 0, y: i })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = thickness
      ctx.stroke()
    }

    const update = () => {
      const now = Date.now()
      if (now - lastSwitch > switchInterval) {
        lastSwitch = now
        for (let i = 0; i < path.length; i++) {
          const p = path[i]
          const isEdge =
            p.x === 0 || p.x === width || p.y === 0 || p.y === height
          if (isEdge) {
            if (p.x === 0) p.x = Math.random() * chaos * 10
            if (p.x === width) p.x = width - Math.random() * chaos * 10
            if (p.y === 0) p.y = Math.random() * chaos * 10
            if (p.y === height) p.y = height - Math.random() * chaos * 10
          }
        }
      }
    }

    let animationFrameId: number
    const animate = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width
        height = entry.contentRect.height
        canvas.width = width
        canvas.height = height
        setup()
      }
    })

    resizeObserver.observe(container)
    setup()
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [color, speed, chaos, thickness])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          borderRadius: style?.borderRadius
        }}
      />
      {children}
    </div>
  )
}
