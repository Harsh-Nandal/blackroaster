'use client'

import { useState } from 'react'
import Link from 'next/link'

const ROOMS = [
  { id: 'living', label: 'Living Room', desc: 'Create a dramatic accent wall that becomes the focal point of your space. Our 3D panels add depth and texture that paint simply cannot achieve — stunning from every angle.' },
  { id: 'bedroom', label: 'Bedroom', desc: 'Introduce warmth and sophistication behind your headboard. Wood-finish and fabric-look panels turn an ordinary bedroom wall into a designer feature.' },
  { id: 'office', label: 'Office & Commercial', desc: 'Professional environments demand premium materials. Our panels deliver a high-end corporate look at a fraction of traditional wall cladding costs — with faster installation too.' },
  { id: 'bathroom', label: 'Bathroom & Kitchen', desc: 'Fully waterproof and humidity-resistant, our panels are engineered for wet areas. Beautiful, hygienic, and maintenance-free — no grouting, no mould worries.' },
]

export default function RoomInspirationSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="section" style={{ background: 'var(--charcoal)', overflow: 'hidden' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Room Inspiration
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, color: 'var(--white)' }}>
          Every Room, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Elevated</em>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }} className="room-display">
        {/* Tabs */}
        <div>
          {ROOMS.map((room, i) => (
            <button
              key={room.id}
              onClick={() => setActive(i)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '1.5rem 1.5rem 1.5rem 2rem', background: 'none', border: 'none', borderLeft: `2px solid ${active === i ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', marginBottom: '0.5rem', transition: 'border-color 0.3s' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: active === i ? 'var(--white)' : 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', transition: 'color 0.3s' }}>
                {room.label}
              </div>
              {active === i && (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', fontWeight: 300, lineHeight: 1.7, margin: 0 }}>
                  {room.desc}
                </p>
              )}
            </button>
          ))}
          <Link
            href="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginTop: '2rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}
          >
            Shop for This Room →
          </Link>
        </div>

        {/* Visual */}
        <div style={{ position: 'relative', aspectRatio: '4/5' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #1a1610 0%, #0d0b08 100%)`, overflow: 'hidden' }}>
            {/* Panel grid visual that changes per room */}
            <div style={{ position: 'absolute', inset: '4px', display: 'grid', gridTemplateColumns: active < 2 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: '3px', transition: 'all 0.5s ease' }}>
              {Array.from({ length: active < 2 ? 15 : 20 }).map((_, i) => (
                <div key={i} style={{ background: `linear-gradient(${135 + (i % 4) * 20}deg, rgba(201,168,106,${0.05 + (i % 3) * 0.04}) 0%, rgba(201,168,106,0.01) 100%)`, border: '1px solid rgba(201,168,106,0.07)', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', border: '1px solid rgba(201,168,106,0.2)' }}>
            <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Perfect For</div>
            <div style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{ROOMS[active].label}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .room-display { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
