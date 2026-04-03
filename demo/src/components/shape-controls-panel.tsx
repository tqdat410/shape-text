import type { ShapeInput } from 'shape-text'

import {
  geometryPresets,
  svgMaskPresets,
  type GeometryPresetId,
  type SvgMaskPresetId,
} from '../demo-presets'
import type { ShapeSource } from '../demo-model'

type ShapeControlsPanelProps = {
  shapeSource: ShapeSource
  geometryPresetId: GeometryPresetId
  svgMaskPresetId: SvgMaskPresetId
  shape: ShapeInput
  showShape: boolean
  shapeFill: string
  onShapeSourceChange: (value: ShapeSource) => void
  onGeometryPresetChange: (value: GeometryPresetId) => void
  onSvgMaskPresetChange: (value: SvgMaskPresetId) => void
  onShapeTextChange: (value: string) => void
  onShapeTextModeChange: (value: 'whole-text' | 'per-character') => void
  onShapeSizeModeChange: (value: 'fit-content' | 'fixed') => void
  onShapeFixedDimensionChange: (dimension: 'width' | 'height', value: number) => void
  onShowShapeChange: (value: boolean) => void
  onShapeFillChange: (value: string) => void
}

export function ShapeControlsPanel(props: ShapeControlsPanelProps) {
  const textMaskShape = props.shape.kind === 'text-mask' ? props.shape : null
  const svgMaskShape = props.shape.kind === 'svg-mask' ? props.shape : null
  const fixedTextMaskSize = textMaskShape?.size?.mode === 'fixed' ? textMaskShape.size : null

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Shape</h2>
        <p>Switch between polygon geometry, a text-derived mask, or an authored SVG silhouette.</p>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Shape source</span>
          <select
            aria-label="Shape source"
            value={props.shapeSource}
            onChange={event => props.onShapeSourceChange(event.target.value as ShapeSource)}
          >
            <option value="value-derived">Text mask</option>
            <option value="geometry">Polygon geometry</option>
            <option value="svg-mask">SVG mask</option>
          </select>
        </label>

        {props.shapeSource === 'geometry' ? (
          <label className="field">
            <span>Geometry preset</span>
            <select
              aria-label="Geometry preset"
              value={props.geometryPresetId}
              onChange={event => props.onGeometryPresetChange(event.target.value as GeometryPresetId)}
            >
              {props.geometryPresetId === 'custom' ? <option value="custom">Custom geometry</option> : null}
              {geometryPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {svgMaskShape !== null ? (
          <label className="field">
            <span>SVG preset</span>
            <select
              aria-label="SVG preset"
              value={props.svgMaskPresetId}
              onChange={event => props.onSvgMaskPresetChange(event.target.value as SvgMaskPresetId)}
            >
              {props.svgMaskPresetId === 'custom' ? <option value="custom">Custom SVG mask</option> : null}
              {svgMaskPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="field checkbox-field">
          <span>Show shape</span>
          <input
            aria-label="Show shape"
            type="checkbox"
            checked={props.showShape}
            onChange={event => props.onShowShapeChange(event.target.checked)}
          />
        </label>

        <label className="field">
          <span>Shape fill</span>
          <input
            aria-label="Shape fill"
            type="color"
            value={props.shapeFill}
            onChange={event => props.onShapeFillChange(event.target.value)}
          />
        </label>
      </div>

      {textMaskShape !== null ? (
        <div className="field-grid">
          <label className="field">
            <span>Shape value</span>
            <input
              aria-label="Shape value"
              type="text"
              value={textMaskShape.text}
              onChange={event => props.onShapeTextChange(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Shape text mode</span>
            <select
              aria-label="Shape text mode"
              value={textMaskShape.shapeTextMode ?? 'whole-text'}
              onChange={event =>
                props.onShapeTextModeChange(event.target.value as 'whole-text' | 'per-character')
              }
            >
              <option value="whole-text">Whole text shape</option>
              <option value="per-character">Per-character regions</option>
            </select>
          </label>

          <label className="field">
            <span>Shape size mode</span>
            <select
              aria-label="Shape size mode"
              value={textMaskShape.size?.mode === 'fixed' ? 'fixed' : 'fit-content'}
              onChange={event => props.onShapeSizeModeChange(event.target.value as 'fit-content' | 'fixed')}
            >
              <option value="fit-content">Fit content</option>
              <option value="fixed">Fixed box</option>
            </select>
          </label>

          {fixedTextMaskSize !== null ? (
            <>
              <label className="field">
                <span>Fixed width</span>
                <input
                  aria-label="Fixed width"
                  type="number"
                  min="1"
                  step="1"
                   value={fixedTextMaskSize.width}
                   onChange={event => props.onShapeFixedDimensionChange('width', Number(event.target.value))}
                 />
              </label>

              <label className="field">
                <span>Fixed height</span>
                <input
                  aria-label="Fixed height"
                  type="number"
                  min="1"
                  step="1"
                   value={fixedTextMaskSize.height}
                   onChange={event => props.onShapeFixedDimensionChange('height', Number(event.target.value))}
                 />
              </label>
            </>
          ) : null}
        </div>
      ) : null}

      {svgMaskShape !== null ? (
        <p className="panel-copy">
          SVG mask mode keeps the live controls light. Switch presets here, then use the JSON editor below if you want
          to edit the raw path, viewBox, or fixed-size box.
        </p>
      ) : null}
    </section>
  )
}
