import {
  compileShapeForLayout,
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
} from '/dist/index.js'

const stage = document.querySelector('#stage')
const summary = document.querySelector('#summary')
const textInput = document.querySelector('#text-input')
const lineHeightInput = document.querySelector('#line-height-input')
const lineHeightValue = document.querySelector('#line-height-value')
const textSizeInput = document.querySelector('#text-size-input')
const textSizeValue = document.querySelector('#text-size-value')
const textWeightSelect = document.querySelector('#text-weight-select')
const textItalicInput = document.querySelector('#text-italic-input')
const textColorInput = document.querySelector('#text-color-input')
const shapeFillInput = document.querySelector('#shape-fill-input')
const shapeBorderWidthInput = document.querySelector('#shape-border-width-input')
const shapeBorderWidthValue = document.querySelector('#shape-border-width-value')
const shapeBorderColorInput = document.querySelector('#shape-border-color-input')
const shapeShadowInput = document.querySelector('#shape-shadow-input')
const showShapeInput = document.querySelector('#show-shape-input')
const renderButton = document.querySelector('#render-button')
const measurer = createCanvasTextMeasurer()

const defaultParagraph = [
  'Shape text lets a paragraph travel inside a silhouette thay vi chi wrap quanh float.',
  'Ban co the dung no de render layout hinh so 2, badge, logo block, hoac poster typography.',
  'E2E local o day uu tien deterministic browser path: build dist, import module, render SVG, assert lai state.',
].join(' ')

function createDigitTwoPolygon(width, height) {
  return [
    { x: width * 0.12, y: height * 0.1 },
    { x: width * 0.34, y: 0 },
    { x: width * 0.72, y: height * 0.02 },
    { x: width * 0.9, y: height * 0.16 },
    { x: width * 0.88, y: height * 0.32 },
    { x: width * 0.74, y: height * 0.44 },
    { x: width * 0.5, y: height * 0.57 },
    { x: width * 0.26, y: height * 0.72 },
    { x: width * 0.14, y: height * 0.86 },
    { x: width * 0.88, y: height * 0.86 },
    { x: width * 0.86, y: height },
    { x: 0, y: height },
    { x: 0, y: height * 0.78 },
    { x: width * 0.12, y: height * 0.64 },
    { x: width * 0.35, y: height * 0.5 },
    { x: width * 0.62, y: height * 0.35 },
    { x: width * 0.74, y: height * 0.26 },
    { x: width * 0.72, y: height * 0.14 },
    { x: width * 0.58, y: height * 0.08 },
    { x: width * 0.34, y: height * 0.08 },
  ]
}

const scenarios = {
  'glyph-two-repeat': {
    shape: {
      kind: 'text-mask',
      text: '2',
      font: '700 420px Arial',
      width: 340,
      height: 460,
      padding: 10,
      maskScale: 2,
    },
    autoFill: true,
    text: 'ONE',
  },
  'digit-two-wide': {
    shape: { kind: 'polygon', points: createDigitTwoPolygon(340, 460) },
    text: defaultParagraph,
  },
  'digit-two-narrow': {
    shape: { kind: 'polygon', points: createDigitTwoPolygon(240, 460) },
    text: defaultParagraph,
  },
  'rectangle-wide': {
    shape: {
      kind: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 340, y: 0 },
        { x: 340, y: 360 },
        { x: 0, y: 360 },
      ],
    },
    text: defaultParagraph,
  },
  'rectangle-narrow': {
    shape: {
      kind: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 220, y: 0 },
        { x: 220, y: 360 },
        { x: 0, y: 360 },
      ],
    },
    text: defaultParagraph,
  },
}

const state = {
  scenario: '',
  layout: null,
  svg: '',
  text: 'ONE',
  lineHeight: 22,
  textSize: 18,
  textWeight: 700,
  textItalic: false,
  textColor: '#111827',
  showShape: true,
  shapeFill: '#dbeafe',
  shapeBorderWidth: 2,
  shapeBorderColor: '#94a3b8',
  shapeShadow: true,
}

function getTextStyle() {
  return {
    family: '"Helvetica Neue", Arial, sans-serif',
    size: state.textSize,
    weight: state.textWeight,
    style: state.textItalic ? 'italic' : 'normal',
    color: state.textColor,
  }
}

function getShapeStyle() {
  return {
    backgroundColor: state.shapeFill,
    borderColor: state.shapeBorderColor,
    borderWidth: state.shapeBorderWidth,
    shadow: state.shapeShadow
      ? {
          color: 'rgba(15, 23, 42, 0.22)',
          blur: 6,
          offsetX: 0,
          offsetY: 6,
        }
      : undefined,
  }
}

function renderScenario(name) {
  const scenario = scenarios[name]
  if (!scenario) throw new Error(`Unknown scenario: ${name}`)

  state.text = scenario.text ?? state.text

  const layout = layoutTextInShape({
    text: state.text,
    textStyle: getTextStyle(),
    lineHeight: state.lineHeight,
    shape: scenario.shape,
    measurer,
    minSlotWidth: 24,
    autoFill: scenario.autoFill,
  })

  const svg = renderLayoutToSvg(layout, {
    background: '#fffdf7',
    shapeStyle: getShapeStyle(),
    showShape: state.showShape,
    padding: 12,
  })

  state.scenario = name
  state.layout = layout
  state.svg = svg
  textInput.value = state.text
  stage.innerHTML = svg
  summary.textContent = JSON.stringify(
    {
      scenario: name,
      shapeKind: scenario.shape.kind,
      autoFill: Boolean(scenario.autoFill),
      lineHeight: state.lineHeight,
      textStyle: getTextStyle(),
      shapeStyle: getShapeStyle(),
      lineCount: layout.lines.length,
      exhausted: layout.exhausted,
      firstLine: layout.lines[0]?.text ?? null,
      lastLine: layout.lines.at(-1)?.text ?? null,
    },
    null,
    2,
  )
}

window.shapeTextTestApi = {
  renderScenario,
  compileScenarioTwice(name) {
    const scenario = scenarios[name]
    if (!scenario) throw new Error(`Unknown scenario: ${name}`)

    const first = compileShapeForLayout({
      shape: scenario.shape,
      lineHeight: state.lineHeight,
      minSlotWidth: 24,
    })
    const second = compileShapeForLayout({
      shape: scenario.shape,
      lineHeight: state.lineHeight,
      minSlotWidth: 24,
    })

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
          text: '2',
          font: '700 420px Arial',
          width: 340,
          height: 460,
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

function syncControls() {
  textInput.value = state.text
  lineHeightInput.value = String(state.lineHeight)
  lineHeightValue.textContent = String(state.lineHeight)
  textSizeInput.value = String(state.textSize)
  textSizeValue.textContent = String(state.textSize)
  textWeightSelect.value = String(state.textWeight)
  textItalicInput.checked = state.textItalic
  textColorInput.value = state.textColor
  showShapeInput.checked = state.showShape
  shapeFillInput.value = state.shapeFill
  shapeBorderWidthInput.value = String(state.shapeBorderWidth)
  shapeBorderWidthValue.textContent = String(state.shapeBorderWidth)
  shapeBorderColorInput.value = state.shapeBorderColor
  shapeShadowInput.checked = state.shapeShadow
}

renderButton.addEventListener('click', () => {
  state.text = textInput.value
  state.lineHeight = Number(lineHeightInput.value)
  state.textSize = Number(textSizeInput.value)
  state.textWeight = Number(textWeightSelect.value)
  state.textItalic = textItalicInput.checked
  state.textColor = textColorInput.value
  state.showShape = showShapeInput.checked
  state.shapeFill = shapeFillInput.value
  state.shapeBorderWidth = Number(shapeBorderWidthInput.value)
  state.shapeBorderColor = shapeBorderColorInput.value
  state.shapeShadow = shapeShadowInput.checked
  lineHeightValue.textContent = String(state.lineHeight)
  textSizeValue.textContent = String(state.textSize)
  shapeBorderWidthValue.textContent = String(state.shapeBorderWidth)
  renderScenario(state.scenario || 'digit-two-wide')
})

lineHeightInput.addEventListener('input', () => {
  lineHeightValue.textContent = lineHeightInput.value
})

textSizeInput.addEventListener('input', () => {
  textSizeValue.textContent = textSizeInput.value
})

shapeBorderWidthInput.addEventListener('input', () => {
  shapeBorderWidthValue.textContent = shapeBorderWidthInput.value
})

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    renderScenario(button.getAttribute('data-scenario'))
  })
})

syncControls()
renderScenario('glyph-two-repeat')
