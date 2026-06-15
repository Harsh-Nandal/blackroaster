'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!cursor || !ring) return

    let mouseX = -100, mouseY = -100
    let ringX = -100, ringY = -100
    let animFrame

    const moveCursor = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      cursor.style.left = `${mouseX}px`
      cursor.style.top = `${mouseY}px`
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`
      animFrame = requestAnimationFrame(animate)
    }

    const onEnterLink = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)'
      ring.style.width = '60px'
      ring.style.height = '60px'
      ring.style.opacity = '0.3'
    }

    const onLeaveLink = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)'
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.opacity = '0.6'
    }

    document.addEventListener('mousemove', moveCursor)
    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    animFrame = requestAnimationFrame(animate)

    // Observe DOM for new interactive elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', moveCursor)
      cancelAnimationFrame(animFrame)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        @media (pointer: coarse) {
          .lw-cursor, .lw-cursor-ring { display: none !important; }
        }
        body { cursor: none; }
        @media (pointer: coarse) { body { cursor: auto; } }
      `}</style>
      <div
        ref={cursorRef}
        className="lw-cursor"
        style={{
          position: 'fixed',
          width: '10px',
          height: '10px',
          background: 'var(--gold)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-50%,-50%)',
          transition: 'transform 0.1s ease',
          mixBlendMode: 'multiply',
          left: '-100px',
          top: '-100px',
        }}
      />
      <div
        ref={ringRef}
        className="lw-cursor-ring"
        style={{
          position: 'fixed',
          width: '36px',
          height: '36px',
          border: '1.5px solid var(--gold)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-50%,-50%)',
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
          opacity: 0.6,
          left: '-100px',
          top: '-100px',
        }}
      />
    </>
  )
}
