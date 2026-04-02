function clonePoints(points) {
  return points.map(point => ({ x: point.x, y: point.y }))
}

function cloneDemoState(state) {
  return {
    ...state,
    polygonPoints: clonePoints(state.polygonPoints),
  }
}

function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }

  return value
}

function assertPositiveFiniteNumber(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite positive number`)
  }

  return value
}

function hasOwnProperty(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function normalizeTextMaskSize(size) {
  if (size === undefined) {
    return { mode: 'fit-content' }
  }

  if (size === null || typeof size !== 'object' || Array.isArray(size)) {
    throw new Error('layout.shape.size must be an object')
  }

  const mode = size.mode ?? 'fit-content'
  if (mode !== 'fit-content' && mode !== 'fixed') {
    throw new Error('layout.shape.size.mode must be fit-content or fixed')
  }

  const padding =
    size.padding === undefined
      ? undefined
      : assertFiniteNumber(Number(size.padding), 'layout.shape.size.padding')

  if (padding !== undefined && padding < 0) {
    throw new Error('layout.shape.size.padding must be a finite non-negative number')
  }

  if (mode === 'fixed') {
    return {
      mode,
      width: assertPositiveFiniteNumber(Number(size.width), 'layout.shape.size.width'),
      height: assertPositiveFiniteNumber(Number(size.height), 'layout.shape.size.height'),
      padding,
    }
  }

  return {
    mode,
    padding,
  }
}

function normalizeShape(shape) {
  if (shape.kind === 'text-mask') {
    if (hasOwnProperty(shape, 'width') || hasOwnProperty(shape, 'height') || hasOwnProperty(shape, 'padding')) {
      throw new Error('layout.shape.width, height, and padding moved to layout.shape.size')
    }

    const shapeTextMode = shape.shapeTextMode ?? 'whole-text'
    if (shapeTextMode !== 'whole-text' && shapeTextMode !== 'per-character') {
      throw new Error('layout.shape.shapeTextMode must be whole-text or per-character')
    }

    return {
      kind: 'text-mask',
      text: String(shape.text),
      font: String(shape.font),
      size: normalizeTextMaskSize(shape.size),
      shapeTextMode,
      maskScale:
        shape.maskScale === undefined
          ? undefined
          : assertFiniteNumber(Number(shape.maskScale), 'layout.shape.maskScale'),
      alphaThreshold:
        shape.alphaThreshold === undefined
          ? undefined
          : assertFiniteNumber(Number(shape.alphaThreshold), 'layout.shape.alphaThreshold'),
    }
  }

  if (!Array.isArray(shape.points) || shape.points.length < 3) {
    throw new Error('layout.shape.points must contain at least 3 points')
  }

  return {
    kind: 'polygon',
    points: shape.points.map((point, index) => ({
      x: assertFiniteNumber(Number(point.x), `layout.shape.points[${index}].x`),
      y: assertFiniteNumber(Number(point.y), `layout.shape.points[${index}].y`),
    })),
  }
}

function buildTextMaskSize(state) {
  if (state.shapeSizeMode === 'fixed') {
    return {
      mode: 'fixed',
      width: state.shapeWidth,
      height: state.shapeHeight,
      padding: state.shapePadding,
    }
  }

  return {
    mode: 'fit-content',
    padding: state.shapePadding,
  }
}

export function buildDemoPayload(state) {
  const shape =
    state.shapeKind === 'text-mask'
      ? {
          kind: 'text-mask',
          text: state.shapeText,
          font: state.shapeFont,
          size: buildTextMaskSize(state),
          shapeTextMode: state.shapeTextMode,
          maskScale: state.shapeMaskScale,
          alphaThreshold: state.shapeAlphaThreshold,
        }
      : {
          kind: 'polygon',
          points: clonePoints(state.polygonPoints),
        }

  return {
    layout: {
      text: state.text,
      textStyle: {
        family: '"Helvetica Neue", Arial, sans-serif',
        size: state.textSize,
        weight: state.textWeight,
        style: state.textItalic ? 'italic' : 'normal',
        color: state.textColor,
      },
      lineHeight: state.lineHeight,
      shape,
      minSlotWidth: state.minSlotWidth ?? (state.fillStrategy === 'max' ? 8 : 24),
      autoFill: state.autoFill,
      autoFillMode: state.autoFillMode,
      fillStrategy: state.fillStrategy,
    },
    render: {
      background: state.background,
      shapeStyle: {
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
      },
      showShape: state.showShape,
      padding: state.renderPadding,
    },
  }
}

export function serializeDemoPayload(state) {
  return JSON.stringify(buildDemoPayload(state), null, 2)
}

export function applyDemoPayloadToState(state, payload) {
  if (payload === null || typeof payload !== 'object') {
    throw new Error('payload must be an object')
  }

  const layout = payload.layout
  const render = payload.render
  if (layout === null || typeof layout !== 'object') {
    throw new Error('payload.layout must be an object')
  }
  if (render === null || typeof render !== 'object') {
    throw new Error('payload.render must be an object')
  }

  const nextState = cloneDemoState(state)

  nextState.text = String(layout.text ?? nextState.text)
  nextState.lineHeight = assertFiniteNumber(Number(layout.lineHeight ?? nextState.lineHeight), 'layout.lineHeight')
  nextState.minSlotWidth =
    layout.minSlotWidth === undefined
      ? nextState.minSlotWidth
      : assertFiniteNumber(Number(layout.minSlotWidth), 'layout.minSlotWidth')
  nextState.autoFill = Boolean(layout.autoFill ?? nextState.autoFill)
  nextState.fillStrategy =
    layout.fillStrategy === undefined ? nextState.fillStrategy : layout.fillStrategy === 'max' ? 'max' : 'flow'
  nextState.autoFillMode =
    layout.autoFillMode === undefined
      ? nextState.autoFillMode
      : layout.autoFillMode === 'dense' || layout.autoFillMode === 'stream'
        ? layout.autoFillMode
        : 'words'

  if (layout.textStyle !== null && typeof layout.textStyle === 'object') {
    nextState.textSize = assertFiniteNumber(
      Number(layout.textStyle.size ?? nextState.textSize),
      'layout.textStyle.size',
    )
    nextState.textWeight = Number(layout.textStyle.weight ?? nextState.textWeight)
    nextState.textItalic =
      layout.textStyle.style === undefined
        ? nextState.textItalic
        : String(layout.textStyle.style) !== 'normal'
    nextState.textColor = String(layout.textStyle.color ?? nextState.textColor)
  }

  const shape = normalizeShape(layout.shape)
  nextState.shapeKind = shape.kind
  if (shape.kind === 'text-mask') {
    nextState.shapeText = shape.text
    nextState.shapeFont = shape.font
    nextState.shapeSizeMode = shape.size.mode === 'fixed' ? 'fixed' : 'fit-content'
    if (shape.size.mode === 'fixed') {
      nextState.shapeWidth = shape.size.width
      nextState.shapeHeight = shape.size.height
    }
    nextState.shapeTextMode = shape.shapeTextMode
    nextState.shapePadding = shape.size.padding ?? 0
    nextState.shapeMaskScale = shape.maskScale ?? 2
    nextState.shapeAlphaThreshold = shape.alphaThreshold
  } else {
    nextState.polygonPoints = shape.points
  }

  nextState.background = String(render.background ?? nextState.background)
  nextState.showShape = Boolean(render.showShape ?? nextState.showShape)
  nextState.renderPadding = assertFiniteNumber(
    Number(render.padding ?? nextState.renderPadding),
    'render.padding',
  )

  if (render.shapeStyle !== null && typeof render.shapeStyle === 'object') {
    nextState.shapeFill = String(render.shapeStyle.backgroundColor ?? nextState.shapeFill)
    nextState.shapeBorderColor = String(render.shapeStyle.borderColor ?? nextState.shapeBorderColor)
    nextState.shapeBorderWidth = assertFiniteNumber(
      Number(render.shapeStyle.borderWidth ?? nextState.shapeBorderWidth),
      'render.shapeStyle.borderWidth',
    )
    nextState.shapeShadow = render.shapeStyle.shadow !== undefined
  }

  Object.assign(state, nextState)
  state.polygonPoints = nextState.polygonPoints
}
