import { PayloadEditorPanel } from './components/payload-editor-panel'
import { RenderSummaryPanel } from './components/render-summary-panel'
import { ShapeControlsPanel } from './components/shape-controls-panel'
import { SvgOutputViewport } from './components/svg-output-viewport'
import { TextControlsPanel } from './components/text-controls-panel'
import { useRenderedDemoRequest } from './use-rendered-demo-request'
import { useShapeParagraphWorkbench } from './use-shape-paragraph-workbench'

export function App() {
  const workbench = useShapeParagraphWorkbench()
  const rendered = useRenderedDemoRequest(workbench.request)
  const isTextMask = workbench.request.layout.shape.kind === 'text-mask'
  const isSvgMask = workbench.request.layout.shape.kind === 'svg-mask'
  const textWeight = String(workbench.request.layout.textStyle.weight ?? '700')
  const textItalic = (workbench.request.layout.textStyle.style ?? 'normal') !== 'normal'
  const textColor = workbench.request.layout.textStyle.color ?? '#0f172a'
  const shapeFill = workbench.request.render.shapeStyle?.backgroundColor ?? '#dbeafe'

  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">shape-text</p>
        <h1>Shape text playground</h1>
        <p className="hero-copy">
          Pick a paragraph, choose one of the three shape inputs, and watch the SVG update live. The same API can flow
          readable copy, max-fill decorative text, or data-looking filler inside custom silhouettes.
        </p>
        <ul className="hero-points">
          <li>Use polygon geometry when you already have points.</li>
          <li>Use text-mask when the shape should come from text like `23` or `SALE`.</li>
          <li>Use svg-mask when you already have an authored silhouette path.</li>
        </ul>
      </section>

      <section className="layout-grid">
        <div className="sidebar">
          <TextControlsPanel
            text={workbench.request.layout.text}
            fillPresetId={workbench.fillPresetId}
            autoFill={workbench.request.layout.autoFill}
            textSize={workbench.request.layout.textStyle.size}
            lineHeight={workbench.request.layout.lineHeight}
            textWeight={textWeight}
            textItalic={textItalic}
            textColor={textColor}
            onTextChange={workbench.setText}
            onFillPresetChange={workbench.setFillPreset}
            onFillPresetReroll={workbench.rerollFillPreset}
            onAutoFillChange={workbench.setAutoFill}
            onTextSizeChange={workbench.setTextSize}
            onLineHeightChange={workbench.setLineHeight}
            onTextWeightChange={workbench.setTextWeight}
            onTextItalicChange={workbench.setTextItalic}
            onTextColorChange={workbench.setTextColor}
          />

          <ShapeControlsPanel
            shapeSource={workbench.shapeSource}
            geometryPresetId={workbench.geometryPresetId}
            svgMaskPresetId={workbench.svgMaskPresetId}
            shape={workbench.request.layout.shape}
            showShape={workbench.request.render.showShape ?? true}
            shapeFill={shapeFill}
            onShapeSourceChange={workbench.setShapeSource}
            onGeometryPresetChange={workbench.setGeometryPreset}
            onSvgMaskPresetChange={workbench.setSvgMaskPreset}
            onShapeTextChange={workbench.setShapeText}
            onShapeTextModeChange={workbench.setShapeTextMode}
            onShapeSizeModeChange={workbench.setShapeSizeMode}
            onShapeFixedDimensionChange={workbench.setShapeFixedDimension}
            onShowShapeChange={workbench.setShowShape}
            onShapeFillChange={workbench.setShapeFill}
          />

          <PayloadEditorPanel request={workbench.request} onApply={workbench.applyRequest} />
        </div>

        <div className="main-panel">
          <SvgOutputViewport svg={rendered.svg} />
          <RenderSummaryPanel
            layout={rendered.layout}
            shapeSource={workbench.shapeSource}
            error={rendered.error}
          />

          {isTextMask ? (
            <p className="mode-note">
              Text mask mode is the fastest way to turn numbers, words, and labels into shape-driven text art.
            </p>
          ) : isSvgMask ? (
            <p className="mode-note">
              SVG mask mode keeps path geometry in the shape layer, so the paragraph logic can stay identical while the
              silhouette comes from authored vector art.
            </p>
          ) : (
            <p className="mode-note">
              Polygon mode uses the same layout engine. Only the source of the silhouette changes.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
