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
    showShape: false,
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
}

function renderScenario(name) {
  const scenario = scenarios[name]
  if (!scenario) throw new Error(`Unknown scenario: ${name}`)

  state.text = scenario.text ?? state.text

  const layout = layoutTextInShape({
    text: state.text,
    font: '16px "Helvetica Neue", Arial, sans-serif',
    lineHeight: state.lineHeight,
    shape: scenario.shape,
    measurer,
    minSlotWidth: 24,
    autoFill: scenario.autoFill,
  })

  const svg = renderLayoutToSvg(layout, {
    background: '#fffdf7',
    textFill: '#111827',
    shapeStroke: '#94a3b8',
    shapeFill: 'rgba(191, 219, 254, 0.18)',
    showShape: scenario.showShape ?? true,
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
}

renderButton.addEventListener('click', () => {
  state.text = textInput.value
  state.lineHeight = Number(lineHeightInput.value)
  lineHeightValue.textContent = String(state.lineHeight)
  renderScenario(state.scenario || 'digit-two-wide')
})

lineHeightInput.addEventListener('input', () => {
  lineHeightValue.textContent = lineHeightInput.value
})

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    renderScenario(button.getAttribute('data-scenario'))
  })
})

syncControls()
renderScenario('glyph-two-repeat')
