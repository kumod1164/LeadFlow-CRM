"use client"

import { useEffect, useRef } from "react"

interface GlitterOverlayProps {
  density?: number
  speed?: number
  size?: number
  colors?: string[]
}

export default function GlitterOverlay({
  density = 50,
  speed = 1,
  size = 3,
  colors = ["#ffb6c1", "#e6e6fa", "#ffffff", "#ffc0cb", "#dda0dd"],
}: GlitterOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create glitter particles
    const particles: {
      x: number
      y: number
      size: number
      color: string
      vx: number
      vy: number
      alpha: number
      alphaSpeed: number
    }[] = []

    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * size + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        alpha: Math.random(),
        alphaSpeed: 0.01 + Math.random() * 0.03,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Update alpha (twinkling effect)
        p.alpha += p.alphaSpeed
        if (p.alpha > 1 || p.alpha < 0) p.alphaSpeed = -p.alphaSpeed

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          p.color +
          Math.floor(p.alpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [density, speed, size, colors])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" style={{ mixBlendMode: "screen" }} />
  )
}
