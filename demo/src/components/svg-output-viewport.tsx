import { useEffect, useRef, useState } from 'react'

type SvgOutputViewportProps = {
  svg: string
}

function readSvgSize(svg: SVGSVGElement | null) {
  if (svg === null) {
    return { width: 0, height: 0 }
  }

  const viewBox = svg.viewBox.baseVal
  if (viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height }
  }

  return {
    width: Number(svg.getAttribute('width') ?? 0),
    height: Number(svg.getAttribute('height') ?? 0),
  }
}

export function SvgOutputViewport(props: SvgOutputViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 })

  function fitZoom() {
    const viewport = viewportRef.current
    const { width, height } = contentSize
    if (viewport === null || width <= 0 || height <= 0) {
      return
    }

    setZoom(
      Math.min(1, (viewport.clientWidth - 24) / width, (viewport.clientHeight - 24) / height),
    )
  }

  useEffect(() => {
    const nextSize = readSvgSize(stageRef.current?.querySelector('svg') ?? null)
    setContentSize(nextSize)
    const frame = window.requestAnimationFrame(() => fitZoom())
    return () => window.cancelAnimationFrame(frame)
  }, [props.svg])

  return (
    <section className="panel stage-panel">
      <div className="panel-heading">
        <h2>SVG output</h2>
        <p>Inspect the full rendered output, zoom in, zoom out, or fit the current shape paragraph.</p>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => setZoom(current => Math.max(0.2, Number((current - 0.1).toFixed(2))))}>
          Zoom out
        </button>
        <button type="button" onClick={() => setZoom(current => Number((current + 0.1).toFixed(2)))}>
          Zoom in
        </button>
        <button type="button" onClick={() => setZoom(1)}>100%</button>
        <button type="button" onClick={fitZoom}>Fit</button>
        <span className="zoom-label" data-testid="stage-zoom">{Math.round(zoom * 100)}%</span>
      </div>

      <div ref={viewportRef} className="stage-viewport" data-testid="stage-viewport">
        <div
          className="stage-scale-box"
          style={{
            width: contentSize.width * zoom,
            height: contentSize.height * zoom,
          }}
        >
          <div
            ref={stageRef}
            className="stage"
            data-testid="stage"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: props.svg }}
          />
        </div>
      </div>
    </section>
  )
}
