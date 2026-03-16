"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface SparkleProps {
  color?: string
  size?: number
  style?: React.CSSProperties
}

const generateSparkle = (color: string) => {
  const sparkle = {
    id: String(Math.random()),
    createdAt: Date.now(),
    color,
    size: Math.random() * 10 + 5,
    style: {
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      zIndex: 2,
    },
  }
  return sparkle
}

const Sparkle = ({ color = "#FFC700", size = 10, style = {} }: SparkleProps) => {
  const path =
    "M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z"

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 68 68"
      fill="none"
      style={style}
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 0.8, 1, 0],
        rotate: [0, 0, 180, 180, 0],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      <path d={path} fill={color} />
    </motion.svg>
  )
}

interface SparklesProps {
  children: React.ReactNode
  className?: string
  color?: string
  sparklesCount?: number
  minDelay?: number
  maxDelay?: number
}

export default function Sparkles({
  children,
  className = "",
  color = "#FFC700",
  sparklesCount = 8,
  minDelay = 5,
  maxDelay = 10,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<any[]>([])
  const { theme } = useTheme()

  // Adjust color based on theme
  const sparkleColor = theme === "dark" ? color : color

  useEffect(() => {
    // Initial sparkles
    const initialSparkles = Array.from({ length: sparklesCount }, () => generateSparkle(sparkleColor))
    setSparkles(initialSparkles)

    // Create new sparkles periodically
    const interval = setInterval(
      () => {
        setSparkles((currentSparkles) => {
          const now = Date.now()
          const filteredSparkles = currentSparkles.filter((sparkle) => {
            const delta = now - sparkle.createdAt
            return delta < 1000
          })

          if (filteredSparkles.length < sparklesCount) {
            const newSparkle = generateSparkle(sparkleColor)
            return [...filteredSparkles, newSparkle]
          }

          return filteredSparkles
        })
      },
      Math.random() * (maxDelay - minDelay) * 1000 + minDelay * 1000,
    )

    return () => clearInterval(interval)
  }, [sparklesCount, sparkleColor, minDelay, maxDelay])

  return (
    <span className={`inline-block relative ${className}`}>
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
      ))}
      <span className="relative z-1">{children}</span>
    </span>
  )
}
