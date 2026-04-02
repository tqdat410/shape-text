import { layoutTextInShape, renderLayoutToSvg } from '/dist/index.js'
import {
  applyDemoPayloadToState,
  buildDemoPayload,
  serializeDemoPayload,
} from './demo-payload-helpers.js'
import {
  fillTextPresets,
  findFillTextPresetById,
  identifyFillTextPresetId,
  resolveFillTextPresetText,
} from './demo-fill-presets.js'
import { demoScenarios } from './demo-scenarios.js'

export function createDemoUiController({ state, elements, measurer, viewport }) {
  let hasUserEditedText = false
  let hasUserEditedShapeText = false
  let hasPayloadDraftChanges = false
  let lastCommittedState = cloneStateSnapshot(state)
  let lastRenderedState = null

  function setPayloadError(message = '') {
    state.payloadError = message
    elements.payloadError.textContent = message
    elements.payloadError.hidden = message.length === 0
  }

  function syncPresetSelection() {
    state.fillPresetId = identifyFillTextPresetId(state.text)
  }

  function cloneStateSnapshot(source) {
    return {
      ...source,
      polygonPoints: source.polygonPoints.map(point => ({ ...point })),
    }
  }

  function updateSummary() {
    const resolvedShapeWidth =
      state.layout === null ? null : state.layout.compiledShape.bounds.right - state.layout.compiledShape.bounds.left
    const resolvedShapeHeight =
      state.layout === null ? null : state.layout.compiledShape.bounds.bottom - state.layout.compiledShape.bounds.top

    elements.summary.textContent = JSON.stringify(
      {
        scenario: state.scenario,
        shapeKind: state.shapeKind,
        shapeText: state.shapeText,
        shapeTextMode: state.shapeTextMode,
        shapeSizeMode: state.shapeSizeMode,
        resolvedShapeWidth,
        resolvedShapeHeight,
        fillPresetId: state.fillPresetId,
        autoFill: state.layout?.autoFill ?? false,
        autoFillMode: state.layout?.autoFillMode ?? null,
        fillStrategy: state.layout?.fillStrategy ?? null,
        lineCount: state.layout?.lines.length ?? 0,
        exhausted: state.layout?.exhausted ?? null,
        stageZoom: state.stageZoom,
        stageSvgWidth: state.stageSvgWidth,
        stageSvgHeight: state.stageSvgHeight,
        payloadError: state.payloadError,
        firstLine: state.layout?.lines[0]?.text ?? null,
        lastLine: state.layout?.lines.at(-1)?.text ?? null,
      },
      null,
      2,
    )
  }

  function renderStateSnapshot(snapshot) {
    const payload = buildDemoPayload(snapshot)
    const layout = layoutTextInShape({ ...payload.layout, measurer })
    const svg = renderLayoutToSvg(layout, payload.render)

    return { layout, svg }
  }

  function commitRenderedState(nextState, rendered) {
    const nextPolygonPoints = nextState.polygonPoints.map(point => ({ ...point }))

    Object.assign(state, nextState)
    state.polygonPoints = nextPolygonPoints
    state.layout = rendered.layout
    state.svg = rendered.svg
    syncPresetSelection()
    syncControls()
    syncPayloadInput()
    setPayloadError('')
    viewport.renderSvg(rendered.svg)
    updateSummary()
    lastCommittedState = cloneStateSnapshot(state)
    lastRenderedState = rendered
  }

  function restoreCommittedState(message) {
    if (lastRenderedState === null) {
      throw new Error(message)
    }

    const restoredState = cloneStateSnapshot(lastCommittedState)
    const restoredPolygonPoints = restoredState.polygonPoints.map(point => ({ ...point }))

    Object.assign(state, restoredState)
    state.polygonPoints = restoredPolygonPoints
    state.layout = lastRenderedState.layout
    state.svg = lastRenderedState.svg
    syncPresetSelection()
    syncControls()
    syncPayloadInput()
    setPayloadError(message)
    viewport.renderSvg(state.svg)
    updateSummary()
  }

  function syncPayloadInput(force = false) {
    const nextDraft = serializeDemoPayload(state)
    if (force || !hasPayloadDraftChanges) {
      state.payloadDraft = nextDraft
      elements.payloadInput.value = nextDraft
      return
    }

    state.payloadDraft = elements.payloadInput.value
  }

  function syncControls() {
    const isTextMask = state.shapeKind === 'text-mask'
    const showFixedSizeFields = isTextMask && state.shapeSizeMode === 'fixed'

    elements.textInput.value = state.text
    elements.shapeTextInput.value = state.shapeText
    elements.shapeTextInput.disabled = !isTextMask
    elements.shapeTextModeSelect.value = state.shapeTextMode
    elements.shapeTextModeSelect.disabled = !isTextMask
    elements.shapeSizeModeSelect.value = state.shapeSizeMode
    elements.shapeSizeModeSelect.disabled = !isTextMask
    elements.shapeFixedWidthField.hidden = !showFixedSizeFields
    elements.shapeFixedHeightField.hidden = !showFixedSizeFields
    elements.shapeFixedWidthInput.disabled = !showFixedSizeFields
    elements.shapeFixedHeightInput.disabled = !showFixedSizeFields
    elements.shapeFixedWidthInput.value = String(state.shapeWidth)
    elements.shapeFixedHeightInput.value = String(state.shapeHeight)
    elements.fillPresetSelect.value = state.fillPresetId
    elements.lineHeightInput.value = String(state.lineHeight)
    elements.lineHeightValue.textContent = String(state.lineHeight)
    elements.textSizeInput.value = String(state.textSize)
    elements.textSizeValue.textContent = String(state.textSize)
    elements.textWeightSelect.value = String(state.textWeight)
    elements.textItalicInput.checked = state.textItalic
    elements.textColorInput.value = state.textColor
    elements.autoFillModeSelect.value = state.fillStrategy === 'max' ? 'max' : state.autoFillMode
    elements.showShapeInput.checked = state.showShape
    elements.shapeFillInput.value = state.shapeFill
    elements.shapeBorderWidthInput.value = String(state.shapeBorderWidth)
    elements.shapeBorderWidthValue.textContent = String(state.shapeBorderWidth)
    elements.shapeBorderColorInput.value = state.shapeBorderColor
    elements.shapeShadowInput.checked = state.shapeShadow
  }

  function applyScenario(name) {
    const scenario = demoScenarios[name]
    if (!scenario) throw new Error(`Unknown scenario: ${name}`)

    state.scenario = name
    state.shapeKind = scenario.shape.kind
    state.autoFill = Boolean(scenario.autoFill)
    if (!hasUserEditedText && scenario.text !== undefined) {
      state.text = scenario.text
    }

    if (scenario.shape.kind === 'text-mask') {
      const size = scenario.shape.size ?? {}
      if (!hasUserEditedShapeText) {
        state.shapeText = scenario.shape.text
      }
      state.shapeFont = scenario.shape.font
      state.shapeSizeMode = size.mode === 'fixed' ? 'fixed' : 'fit-content'
      if (size.mode === 'fixed') {
        state.shapeWidth = size.width
        state.shapeHeight = size.height
      }
      state.shapeTextMode = scenario.shape.shapeTextMode ?? 'whole-text'
      state.shapePadding = size.padding ?? 0
      state.shapeMaskScale = scenario.shape.maskScale ?? 2
      state.shapeAlphaThreshold = scenario.shape.alphaThreshold
      return
    }

    state.polygonPoints = scenario.shape.points.map(point => ({ ...point }))
  }

  function renderCurrentState() {
    const nextState = cloneStateSnapshot(state)

    try {
      commitRenderedState(nextState, renderStateSnapshot(nextState))
    } catch (error) {
      restoreCommittedState(error instanceof Error ? error.message : String(error))
    }
  }

  return {
    populateFillPresetOptions() {
      fillTextPresets.forEach(preset => {
        const option = document.createElement('option')
        option.value = preset.id
        option.textContent = preset.label
        elements.fillPresetSelect.append(option)
      })
    },
    applyScenario,
    renderCurrentState,
    syncControls,
    syncPayloadInput,
    applyFillSelection(value) {
      if (value === 'max') {
        state.autoFillMode = 'stream'
        state.fillStrategy = 'max'
        return
      }

      state.autoFillMode = value
      state.fillStrategy = 'flow'
    },
    handleTextEdited(value) {
      state.text = value
      hasUserEditedText = true
      state.fillPresetId = 'custom'
      syncPayloadInput()
    },
    handleShapeTextEdited(value) {
      state.shapeText = value
      hasUserEditedShapeText = true
      syncPayloadInput()
    },
    handleShapeTextModeSelected(value) {
      state.shapeTextMode = value === 'per-character' ? 'per-character' : 'whole-text'
      syncPayloadInput()
    },
    handleShapeSizeModeSelected(value) {
      state.shapeSizeMode = value === 'fixed' ? 'fixed' : 'fit-content'
      syncControls()
      syncPayloadInput()
    },
    handlePresetSelected(id) {
      const preset = findFillTextPresetById(id)
      const nextText = resolveFillTextPresetText(preset.id)
      if (nextText === null) return
      state.text = nextText
      state.fillPresetId = preset.id
      hasUserEditedText = true
      syncControls()
      syncPayloadInput()
    },
    handlePayloadDraftEdited(value) {
      state.payloadDraft = value
      hasPayloadDraftChanges = true
    },
    applyPayloadText() {
      const nextState = cloneStateSnapshot(state)
      applyDemoPayloadToState(nextState, JSON.parse(elements.payloadInput.value))
      const rendered = renderStateSnapshot(nextState)
      hasPayloadDraftChanges = false
      hasUserEditedText = true
      hasUserEditedShapeText = true
      commitRenderedState(nextState, rendered)
    },
    resetPayloadDraft() {
      hasPayloadDraftChanges = false
      syncPayloadInput(true)
      setPayloadError('')
    },
    setPayloadError,
  }
}
