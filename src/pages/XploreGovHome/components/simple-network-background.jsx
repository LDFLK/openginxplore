
import { useEffect, useRef } from "react"

export default function SimpleNetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Node properties
    const nodes = []
    const nodeCount = 100
    const connectionDistance = 150

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Move nodes
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Draw node with reduced glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(59, 130, 246, 0.5)"
        ctx.fill()

        // Draw connections with reduced glow
        for (let j = i + 1; j < nodes.length; j++) {
          const otherNode = nodes[j]
          const dx = otherNode.x - node.x
          const dy = otherNode.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            const opacity = 1 - distance / connectionDistance
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.25})`
            ctx.lineWidth = opacity * 1.5
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-80" />}
