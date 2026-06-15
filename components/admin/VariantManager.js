'use client'

import { useState } from 'react'

const INPUT = {
  padding: '7px 10px',
  border: '1px solid var(--grey-mid)',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.82rem',
  outline: 'none',
  background: 'var(--white)',
  boxSizing: 'border-box',
  width: '100%',
}

// Cartesian product of attribute values → array of attribute combo objects
function buildCombinations(attributes) {
  if (!attributes.length) return []
  const [first, ...rest] = attributes
  if (!first.values.length) return buildCombinations(rest)
  const restCombos = rest.length ? buildCombinations(rest) : [{}]
  return first.values.flatMap(val =>
    restCombos.map(combo => ({ [first.name]: val, ...combo }))
  )
}

function comboKey(attrs) {
  return Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|')
}

export default function VariantManager({ attributes = [], variants = [], onChange }) {
  const [attrName, setAttrName] = useState('')
  const [attrValues, setAttrValues] = useState('')

  function updateAll(newAttrs, newVariants) {
    onChange(newAttrs, newVariants)
  }

  // ── Attribute management ──────────────────────────────────────────────────

  function addAttribute() {
    const name = attrName.trim()
    const values = attrValues.split(',').map(v => v.trim()).filter(Boolean)
    if (!name || !values.length) return
    if (attributes.some(a => a.name.toLowerCase() === name.toLowerCase())) return
    updateAll([...attributes, { name, values }], variants)
    setAttrName('')
    setAttrValues('')
  }

  function removeAttribute(i) {
    const newAttrs = attributes.filter((_, idx) => idx !== i)
    updateAll(newAttrs, variants)
  }

  function addValueToAttr(attrIdx, rawVal) {
    const val = rawVal.trim()
    if (!val) return
    const newAttrs = attributes.map((a, i) =>
      i === attrIdx && !a.values.includes(val) ? { ...a, values: [...a.values, val] } : a
    )
    updateAll(newAttrs, variants)
  }

  function removeValueFromAttr(attrIdx, valIdx) {
    const newAttrs = attributes.map((a, i) =>
      i === attrIdx ? { ...a, values: a.values.filter((_, vi) => vi !== valIdx) } : a
    )
    updateAll(newAttrs, variants)
  }

  // ── Variant generation ────────────────────────────────────────────────────

  function generateVariants() {
    const combos = buildCombinations(attributes)
    if (!combos.length) return

    // Build a lookup of existing variants by their attribute combo key
    const existingByKey = {}
    variants.forEach(v => {
      if (v.attributes) existingByKey[comboKey(v.attributes)] = v
    })

    const newVariants = combos.map((combo, i) => {
      const key = comboKey(combo)
      const existing = existingByKey[key]
      return existing
        ? existing
        : {
            label: Object.values(combo).join(' / '),
            sku: '',
            price: '',
            salePrice: '',
            stock: 0,
            images: [],
            attributes: combo,
            isDefault: false,
          }
    })
    // Ensure exactly one default — keep existing, otherwise first
    const hasDefault = newVariants.some(v => v.isDefault)
    if (!hasDefault && newVariants.length > 0) newVariants[0].isDefault = true
    updateAll(attributes, newVariants)
  }

  // ── Variant row editing ───────────────────────────────────────────────────

  function updateVariant(idx, field, value) {
    const updated = variants.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    updateAll(attributes, updated)
  }

  function setDefault(idx) {
    const updated = variants.map((v, i) => ({ ...v, isDefault: i === idx }))
    updateAll(attributes, updated)
  }

  function removeVariant(idx) {
    const filtered = variants.filter((_, i) => i !== idx)
    // If the removed one was default, promote first remaining
    if (variants[idx]?.isDefault && filtered.length > 0) filtered[0].isDefault = true
    updateAll(attributes, filtered)
  }

  function addBlankVariant() {
    const hasDefault = variants.some(v => v.isDefault)
    const blank = { label: '', sku: '', price: '', salePrice: '', stock: 0, images: [], attributes: {}, isDefault: !hasDefault }
    updateAll(attributes, [...variants, blank])
  }

  const SECTION = { background: 'var(--ivory)', border: '1px solid var(--grey-mid)', padding: '1.25rem', marginTop: '1rem' }
  const CHIP = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', borderRadius: '2px', marginRight: '6px', marginBottom: '6px' }
  const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 14px', border: 'none', cursor: 'pointer' }

  return (
    <div>
      {/* ── Attributes ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '0.75rem' }}>
          Attributes
        </div>

        {attributes.map((attr, ai) => (
          <div key={ai} style={SECTION}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600 }}>{attr.name}</span>
              <button onClick={() => removeAttribute(ai)} style={{ ...BTN, background: '#fee2e2', color: '#dc2626', padding: '4px 10px' }}>
                Remove
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {attr.values.map((val, vi) => (
                <span key={vi} style={CHIP}>
                  {val}
                  <button onClick={() => removeValueFromAttr(ai, vi)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </span>
              ))}
            </div>

            <AddValueInput onAdd={(val) => addValueToAttr(ai, val)} />
          </div>
        ))}

        {/* Add new attribute */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginTop: '1rem', alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '4px' }}>Attribute Name</div>
            <input style={INPUT} value={attrName} onChange={e => setAttrName(e.target.value)}
              placeholder="e.g. Color" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAttribute())} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '4px' }}>Values (comma-separated)</div>
            <input style={INPUT} value={attrValues} onChange={e => setAttrValues(e.target.value)}
              placeholder="e.g. Red, Blue, Green" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAttribute())} />
          </div>
          <button onClick={addAttribute} style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', whiteSpace: 'nowrap' }}>
            + Add
          </button>
        </div>
      </div>

      {/* ── Generate / Variants header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)' }}>
            Variants ({variants.length})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {attributes.length > 0 && (
            <button onClick={generateVariants} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)' }}>
              ↻ Generate all combinations
            </button>
          )}
          <button onClick={addBlankVariant} style={{ ...BTN, background: 'var(--grey)', color: 'var(--charcoal)' }}>
            + Add manually
          </button>
        </div>
      </div>

      {/* ── Variants table ── */}
      {variants.length === 0 ? (
        <div style={{ padding: '2rem', background: 'var(--ivory)', border: '2px dashed var(--grey-mid)', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--grey-text)' }}>
          No variants yet. Define attributes above then click "Generate all combinations".
        </div>
      ) : (
        <div style={{ border: '1px solid var(--grey-mid)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '44px 2fr 1.4fr 1fr 1fr 80px 36px', gap: '8px', padding: '8px 12px', background: 'var(--ivory)', borderBottom: '1px solid var(--grey-mid)', alignItems: 'center' }}>
            {['Default', 'Label', 'SKU', 'Regular Price (MRP)', 'Sale Price (Discounted)', 'Stock', ''].map(h => (
              <div key={h} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)' }}>{h}</div>
            ))}
          </div>

          {variants.map((v, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '44px 2fr 1.4fr 1fr 1fr 80px 36px', gap: '8px', padding: '8px 12px', borderBottom: '1px solid var(--grey-mid)', alignItems: 'center', background: idx % 2 === 0 ? 'var(--white)' : 'var(--ivory)' }}>

              {/* Default radio */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="defaultVariant"
                  checked={!!v.isDefault}
                  onChange={() => setDefault(idx)}
                  title="Set as default (shown first on product page)"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
              </div>

              <div>
                {v.attributes && Object.keys(v.attributes).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                    {Object.entries(v.attributes).map(([k, val]) => (
                      <span key={k} style={{ background: v.isDefault ? 'var(--gold)' : 'var(--charcoal)', color: v.isDefault ? 'var(--charcoal)' : 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', padding: '1px 6px', letterSpacing: '0.05em' }}>
                        {k}: {val}
                      </span>
                    ))}
                    {v.isDefault && (
                      <span style={{ background: 'var(--gold)', color: 'var(--charcoal)', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', padding: '1px 6px', letterSpacing: '0.05em', fontWeight: 700 }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                )}
                <input style={{ ...INPUT, fontSize: '0.78rem' }} value={v.label || ''} onChange={e => updateVariant(idx, 'label', e.target.value)} placeholder="Variant label" />
              </div>

              <input style={{ ...INPUT, fontFamily: 'monospace', fontSize: '0.75rem' }} value={v.sku || ''} onChange={e => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU" />
              <input style={INPUT} type="number" min="0" value={v.price ?? ''} onChange={e => updateVariant(idx, 'price', e.target.value)} placeholder="MRP" />
              <input style={INPUT} type="number" min="0" value={v.salePrice ?? ''} onChange={e => updateVariant(idx, 'salePrice', e.target.value)} placeholder="If discounted" />
              <input style={INPUT} type="number" min="0" value={v.stock ?? 0} onChange={e => updateVariant(idx, 'stock', Number(e.target.value))} />
              <button onClick={() => removeVariant(idx)}
                style={{ width: '32px', height: '32px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--grey-text)', lineHeight: 1.6 }}>
        <strong>Regular Price (MRP)</strong> is the original price shown crossed-out. <strong>Sale Price</strong> is what the customer pays — enter both to display a discount badge. Leave Sale Price blank if there is no discount.
      </div>
    </div>
  )
}

// Small inline component for adding a value to an existing attribute
function AddValueInput({ onAdd }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <input
        style={{ padding: '5px 8px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', outline: 'none', flex: 1 }}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Add value…"
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onAdd(val)
            setVal('')
          }
        }}
      />
      <button
        onClick={() => { onAdd(val); setVal('') }}
        style={{ padding: '5px 10px', background: 'var(--grey)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.72rem' }}>
        Add
      </button>
    </div>
  )
}
