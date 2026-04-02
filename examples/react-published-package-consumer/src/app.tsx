import { useState } from 'react'
import {
  createPresetFillText,
  defaultCustomFillText,
  fillPresets,
  type FillPresetId,
} from './fill-random-presets'
import { renderExampleSvgCards } from './render-example-svg-cards'
import './app.css'

export function App() {
  const [fillPresetId, setFillPresetId] = useState<FillPresetId>('ascii')
  const [fillText, setFillText] = useState(() => createPresetFillText('ascii'))
  const cards = renderExampleSvgCards({ fillText })

  function handlePresetChange(nextPresetId: FillPresetId) {
    setFillPresetId(nextPresetId)
    setFillText(createPresetFillText(nextPresetId))
  }

  function handleReroll() {
    setFillText(createPresetFillText(fillPresetId))
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Published package consumer</p>
        <h1>React app using shape-text from npm or bun</h1>
        <p className="hero-copy">
          This app imports <code>shape-text</code> through the package name and
          tracks the current package surface inside this repo.
        </p>
        <div className="command-row">
          <code>npm install</code>
          <code>npm run dev</code>
        </div>
        <div className="command-row">
          <code>bun install</code>
          <code>bun run dev</code>
        </div>
        <div className="controls-row">
          <label className="field">
            <span>Random content</span>
            <select
              value={fillPresetId}
              onChange={event =>
                handlePresetChange(event.target.value as FillPresetId)
              }
            >
              {fillPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <button className="reroll-button" onClick={handleReroll} type="button">
            Reroll
          </button>
        </div>
        <label className="field field-textarea">
          <span>Fill text</span>
          <textarea
            rows={4}
            value={fillText}
            onChange={event => {
              setFillPresetId('custom')
              setFillText(event.target.value || defaultCustomFillText)
            }}
          />
        </label>
      </section>

      <section className="card-grid">
        {cards.map(card => (
          <article className="example-card" key={card.title}>
            <div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </div>
            <div
              aria-label={card.title}
              className="svg-frame"
              dangerouslySetInnerHTML={{ __html: card.svg }}
            />
          </article>
        ))}
      </section>
    </main>
  )
}
