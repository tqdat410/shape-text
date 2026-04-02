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
  const textWeight = String(workbench.request.layout.textStyle.weight ?? '700')
  const textItalic = (workbench.request.layout.textStyle.style ?? 'normal') !== 'normal'
  const textColor = workbench.request.layout.textStyle.color ?? '#0f172a'
  const shapeFill = workbench.request.render.shapeStyle?.backgroundColor ?? '#dbeafe'

  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">shape paragraph</p>
        <h1>Shape paragraph workbench</h1>
        <p className="hero-copy">
          One library, two shape sources: explicit geometry input or value-derived input. The demo is now the real browser workbench and the future E2E target.
        </p>
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
            shape={workbench.request.layout.shape}
            showShape={workbench.request.render.showShape ?? true}
            shapeFill={shapeFill}
            onShapeSourceChange={workbench.setShapeSource}
            onGeometryPresetChange={workbench.setGeometryPreset}
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
              Value-derived mode keeps `text-mask` as the low-level API term, but frames it in the UI as a shape source, not a one-off feature.
            </p>
          ) : (
            <p className="mode-note">
              Geometry mode uses the same layout engine, only the compiled shape source changes.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
