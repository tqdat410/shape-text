import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import { createClockFillText, resolveClockGlyphFills } from './create-clock-fill-text'
import { createIctClockSvg } from './create-ict-clock-svg'
import { createReachingHandFillText } from './create-reaching-hand-fill-text'
import { createReachingHandSvg } from './create-reaching-hand-svg'
import { formatIctClockDisplay } from './format-ict-clock-display'
import { getMillisecondsUntilNextSecond } from './get-milliseconds-until-next-second'
import './app.css'

type ClockScreenState = {
  clockValue: string
  glyphFills: string[]
}

const clockFont = '700 340px Ubuntu'
const clockFontSample = '00:00:00'

function createInitialClockScreenState(): ClockScreenState {
  const clockValue = formatIctClockDisplay()

  return {
    clockValue,
    glyphFills: Array.from(clockValue, () => createClockFillText({})),
  }
}

function isClockFontReady(): boolean {
  if (typeof document === 'undefined' || document.fonts === undefined) {
    return true
  }

  try {
    return document.fonts.check(clockFont, clockFontSample)
  } catch {
    return true
  }
}

export function App() {
  const [clockScreen, setClockScreen] = useState(createInitialClockScreenState)
  const [handFillText] = useState(createReachingHandFillText)
  const [fontReady, setFontReady] = useState(() => isClockFontReady())

  const refreshClock = useEffectEvent(() => {
    const nextClockValue = formatIctClockDisplay()

    startTransition(() => {
      setClockScreen(current =>
        current.clockValue === nextClockValue
          ? current
          : {
              clockValue: nextClockValue,
              glyphFills: resolveClockGlyphFills(
                current.clockValue,
                nextClockValue,
                current.glyphFills,
              ),
            },
      )
    })
  })

  useEffect(() => {
    let timeoutId = 0

    const scheduleRefresh = () => {
      refreshClock()

      timeoutId = window.setTimeout(() => {
        scheduleRefresh()
      }, getMillisecondsUntilNextSecond())
    }

    scheduleRefresh()

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (fontReady || typeof document === 'undefined' || document.fonts === undefined) {
      return
    }

    let cancelled = false

    async function loadClockFont() {
      try {
        await Promise.all([
          document.fonts.load(clockFont, clockFontSample),
          document.fonts.ready,
        ])
      } finally {
        if (!cancelled) {
          setFontReady(isClockFontReady())
        }
      }
    }

    void loadClockFont()

    return () => {
      cancelled = true
    }
  }, [fontReady])

  return (
    <main className="showcase-screen">
      <section className="clock-stage">
        <div
          aria-label={`ICT time ${clockScreen.clockValue}`}
          aria-live="polite"
          className="clock-face"
        >
          {Array.from(clockScreen.clockValue).map((glyph, index) => (
            <div
              className="clock-glyph"
              dangerouslySetInnerHTML={{
                __html: createIctClockSvg({
                  clockValue: glyph,
                  fillText: clockScreen.glyphFills[index]!,
                }),
              }}
              key={`${index}-${glyph}`}
            />
          ))}
        </div>
      </section>

      <section className="hand-stage">
        <div
          aria-label="Reaching hand SVG mask example"
          className="hand-art"
          dangerouslySetInnerHTML={{
            __html: createReachingHandSvg({
              fillText: handFillText,
            }),
          }}
        />
      </section>
    </main>
  )
}
