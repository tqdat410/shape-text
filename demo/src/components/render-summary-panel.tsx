import type { ShapeTextLayout } from 'shape-text'

import type { ShapeSource } from '../demo-model'

type RenderSummaryPanelProps = {
  layout: ShapeTextLayout | null
  shapeSource: ShapeSource
  error: string
}

export function RenderSummaryPanel(props: RenderSummaryPanelProps) {
  const width = props.layout === null ? 0 : props.layout.compiledShape.bounds.right - props.layout.compiledShape.bounds.left
  const height = props.layout === null ? 0 : props.layout.compiledShape.bounds.bottom - props.layout.compiledShape.bounds.top
  const regionCount = props.layout?.compiledShape.regions?.length ?? 0

  return (
    <section className="panel summary-panel">
      <div className="panel-heading">
        <h2>Summary</h2>
        <p>Visible app state only. Tests should read this, not private controller internals.</p>
      </div>

      <dl className="summary-grid">
        <div><dt>Shape source</dt><dd data-testid="summary-shape-source">{props.shapeSource}</dd></div>
        <div><dt>Resolved size</dt><dd data-testid="summary-shape-size">{width} × {height}</dd></div>
        <div><dt>Line count</dt><dd data-testid="summary-line-count">{props.layout?.lines.length ?? 0}</dd></div>
        <div><dt>Region count</dt><dd data-testid="summary-region-count">{regionCount}</dd></div>
        <div><dt>Exhausted</dt><dd data-testid="summary-exhausted">{String(props.layout?.exhausted ?? false)}</dd></div>
        <div><dt>Auto fill</dt><dd data-testid="summary-auto-fill">{String(props.layout?.autoFill ?? false)}</dd></div>
      </dl>

      {props.error.length > 0 ? (
        <p aria-live="polite" className="error-box" data-testid="render-error">
          {props.error}
        </p>
      ) : null}
    </section>
  )
}
