import { compileShapeForLayout, createCanvasTextMeasurer } from '/dist/index.js'
import { createDemoSvgViewportController } from './demo-svg-viewport-controller.js'
import { createDemoUiController } from './demo-ui-controller.js'
import { demoScenarios } from './demo-scenarios.js'

const $ = selector => document.querySelector(selector)
const elements = {
  stage: $('#stage'),
  summary: $('#summary'),
  stageViewport: $('#stage-viewport'),
  textInput: $('#text-input'),
  shapeTextInput: $('#shape-text-input'),
  shapeTextModeSelect: $('#shape-text-mode-select'),
  shapeSizeModeSelect: $('#shape-size-mode-select'),
  shapeFixedWidthField: $('#shape-fixed-width-field'),
  shapeFixedWidthInput: $('#shape-fixed-width-input'),
  shapeFixedHeightField: $('#shape-fixed-height-field'),
  shapeFixedHeightInput: $('#shape-fixed-height-input'),
  fillPresetSelect: $('#fill-preset-select'),
  payloadInput: $('#payload-input'),
  payloadError: $('#payload-error'),
  lineHeightInput: $('#line-height-input'),
  lineHeightValue: $('#line-height-value'),
  textSizeInput: $('#text-size-input'),
  textSizeValue: $('#text-size-value'),
  textWeightSelect: $('#text-weight-select'),
  textItalicInput: $('#text-italic-input'),
  textColorInput: $('#text-color-input'),
  autoFillModeSelect: $('#auto-fill-mode-select'),
  shapeFillInput: $('#shape-fill-input'),
  shapeBorderWidthInput: $('#shape-border-width-input'),
  shapeBorderWidthValue: $('#shape-border-width-value'),
  shapeBorderColorInput: $('#shape-border-color-input'),
  shapeShadowInput: $('#shape-shadow-input'),
  showShapeInput: $('#show-shape-input'),
  zoomOutButton: $('#zoom-out-button'),
  zoomInButton: $('#zoom-in-button'),
  zoomResetButton: $('#zoom-reset-button'),
  zoomFitButton: $('#zoom-fit-button'),
  zoomValue: $('#zoom-value'),
}
const state = {
  scenario: 'glyph-two-repeat',
  layout: null,
  svg: '',
  payloadDraft: '',
  payloadError: '',
  text: 'ONE',
  fillPresetId: 'custom',
  lineHeight: 22,
  textSize: 18,
  textWeight: 700,
  textItalic: false,
  textColor: '#111827',
  autoFill: true,
  autoFillMode: 'words',
  fillStrategy: 'flow',
  minSlotWidth: undefined,
  background: '#fffdf7',
  renderPadding: 12,
  showShape: true,
  shapeFill: '#dbeafe',
  shapeBorderWidth: 2,
  shapeBorderColor: '#94a3b8',
  shapeShadow: true,
  shapeKind: 'text-mask',
  shapeText: '23',
  shapeTextMode: 'whole-text',
  shapeSizeMode: 'fit-content',
  shapeFont: '700 420px Arial',
  shapeWidth: 340,
  shapeHeight: 460,
  shapePadding: 10,
  shapeMaskScale: 2,
  shapeAlphaThreshold: undefined,
  polygonPoints: [],
  stageZoom: 1,
  stageSvgWidth: 0,
  stageSvgHeight: 0,
}
const measurer = createCanvasTextMeasurer()
const viewport = createDemoSvgViewportController({ state, elements })
const controller = createDemoUiController({ state, elements, measurer, viewport })

window.shapeTextTestApi = {
  renderScenario(name) {
    controller.applyScenario(name)
    controller.renderCurrentState()
  },
  compileScenarioTwice(name) {
    const scenario = demoScenarios[name]
    if (!scenario) throw new Error(`Unknown scenario: ${name}`)
    const first = compileShapeForLayout({ shape: scenario.shape, lineHeight: state.lineHeight, minSlotWidth: 24 })
    const second = compileShapeForLayout({ shape: scenario.shape, lineHeight: state.lineHeight, minSlotWidth: 24 })
    return {
      sameReference: first === second,
      isFrozen: Object.isFrozen(first) && Object.isFrozen(first.bands),
      bandCount: first.bands.length,
      shapeKind: first.kind,
    }
  },
  compileInvalidTextMaskShape() {
    try {
      compileShapeForLayout({
        shape: {
          kind: 'text-mask',
          text: '23',
          font: '700 420px Arial',
          size: {
            mode: 'fixed',
            width: 340,
            height: 460,
          },
          alphaThreshold: 999,
        },
        lineHeight: state.lineHeight,
        minSlotWidth: 24,
      })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : String(error)
    }
  },
  getState() {
    return state
  },
}

controller.populateFillPresetOptions()
elements.textInput.addEventListener('input', () => controller.handleTextEdited(elements.textInput.value))
elements.shapeTextInput.addEventListener('input', () => controller.handleShapeTextEdited(elements.shapeTextInput.value))
elements.shapeTextModeSelect.addEventListener('change', () =>
  controller.handleShapeTextModeSelected(elements.shapeTextModeSelect.value),
)
elements.shapeSizeModeSelect.addEventListener('change', () =>
  controller.handleShapeSizeModeSelected(elements.shapeSizeModeSelect.value),
)
elements.fillPresetSelect.addEventListener('change', () => controller.handlePresetSelected(elements.fillPresetSelect.value))
elements.payloadInput.addEventListener('input', () => controller.handlePayloadDraftEdited(elements.payloadInput.value))
elements.lineHeightInput.addEventListener('input', () => { state.lineHeight = Number(elements.lineHeightInput.value); controller.syncControls(); controller.syncPayloadInput() })
elements.textSizeInput.addEventListener('input', () => { state.textSize = Number(elements.textSizeInput.value); controller.syncControls(); controller.syncPayloadInput() })
elements.textWeightSelect.addEventListener('change', () => { state.textWeight = Number(elements.textWeightSelect.value); controller.syncPayloadInput() })
elements.textItalicInput.addEventListener('change', () => { state.textItalic = elements.textItalicInput.checked; controller.syncPayloadInput() })
elements.textColorInput.addEventListener('input', () => { state.textColor = elements.textColorInput.value; controller.syncPayloadInput() })
elements.autoFillModeSelect.addEventListener('change', () => { controller.applyFillSelection(elements.autoFillModeSelect.value); controller.syncPayloadInput() })
elements.shapeFillInput.addEventListener('input', () => { state.shapeFill = elements.shapeFillInput.value; controller.syncPayloadInput() })
elements.shapeBorderWidthInput.addEventListener('input', () => { state.shapeBorderWidth = Number(elements.shapeBorderWidthInput.value); controller.syncControls(); controller.syncPayloadInput() })
elements.shapeBorderColorInput.addEventListener('input', () => { state.shapeBorderColor = elements.shapeBorderColorInput.value; controller.syncPayloadInput() })
elements.shapeShadowInput.addEventListener('change', () => { state.shapeShadow = elements.shapeShadowInput.checked; controller.syncPayloadInput() })
elements.showShapeInput.addEventListener('change', () => { state.showShape = elements.showShapeInput.checked; controller.syncPayloadInput() })
elements.shapeFixedWidthInput.addEventListener('input', () => { state.shapeWidth = Number(elements.shapeFixedWidthInput.value); controller.syncPayloadInput() })
elements.shapeFixedHeightInput.addEventListener('input', () => { state.shapeHeight = Number(elements.shapeFixedHeightInput.value); controller.syncPayloadInput() })
elements.zoomOutButton.addEventListener('click', () => viewport.zoomOut())
elements.zoomInButton.addEventListener('click', () => viewport.zoomIn())
elements.zoomResetButton.addEventListener('click', () => viewport.resetZoom())
elements.zoomFitButton.addEventListener('click', () => viewport.fitZoom())
$('#render-button').addEventListener('click', () => controller.renderCurrentState())
$('#apply-payload-button').addEventListener('click', () => {
  try {
    controller.applyPayloadText()
  } catch (error) {
    controller.setPayloadError(error instanceof Error ? error.message : String(error))
  }
})
$('#reset-payload-button').addEventListener('click', () => controller.resetPayloadDraft())
document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    controller.applyScenario(button.getAttribute('data-scenario'))
    controller.renderCurrentState()
  })
})

controller.applyScenario('glyph-two-repeat')
controller.syncControls()
controller.syncPayloadInput(true)
viewport.syncZoomLabel()
controller.renderCurrentState()
