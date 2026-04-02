const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const ZOOM_STEP = 1.25

function clampZoom(value) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value))
}

function parseSvgDimension(svg, attribute) {
  const attributeValue = Number(svg.getAttribute(attribute))
  if (Number.isFinite(attributeValue) && attributeValue > 0) {
    return attributeValue
  }

  const viewBox = svg.getAttribute('viewBox')
  if (!viewBox) {
    return 0
  }

  const parts = viewBox.split(/\s+/).map(Number)
  return Number.isFinite(parts[attribute === 'width' ? 2 : 3]) ? parts[attribute === 'width' ? 2 : 3] : 0
}

function getContentBounds(svg) {
  const width = parseSvgDimension(svg, 'width')
  const height = parseSvgDimension(svg, 'height')
  let left = 0
  let top = 0
  let right = width
  let bottom = height

  try {
    const box = svg.getBBox()
    if (Number.isFinite(box.x) && Number.isFinite(box.width)) {
      left = Math.min(left, box.x)
      right = Math.max(right, box.x + box.width)
    }
    if (Number.isFinite(box.y) && Number.isFinite(box.height)) {
      top = Math.min(top, box.y)
      bottom = Math.max(bottom, box.y + box.height)
    }
  } catch {
    // Ignore SVG bbox failures and fall back to declared dimensions.
  }

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  }
}

export function createDemoSvgViewportController({ state, elements }) {
  let intrinsicSvgWidth = 0
  let intrinsicSvgHeight = 0
  let contentOffsetX = 0
  let contentOffsetY = 0

  function syncZoomLabel() {
    elements.zoomValue.textContent = `${Math.round(state.stageZoom * 100)}%`
  }

  function applyZoom() {
    const svg = elements.stage.querySelector('svg')
    if (svg instanceof SVGSVGElement) {
      svg.style.width = `${intrinsicSvgWidth * state.stageZoom}px`
      svg.style.height = `${intrinsicSvgHeight * state.stageZoom}px`
      svg.style.marginLeft = `${contentOffsetX * state.stageZoom}px`
      svg.style.marginTop = `${contentOffsetY * state.stageZoom}px`
      svg.style.transform = 'none'
    }

    elements.stage.style.width = `${state.stageSvgWidth * state.stageZoom}px`
    elements.stage.style.height = `${state.stageSvgHeight * state.stageZoom}px`
    syncZoomLabel()
  }

  function syncStageMetrics() {
    const svg = elements.stage.querySelector('svg')
    if (!(svg instanceof SVGSVGElement)) {
      intrinsicSvgWidth = 0
      intrinsicSvgHeight = 0
      contentOffsetX = 0
      contentOffsetY = 0
      state.stageSvgWidth = 0
      state.stageSvgHeight = 0
      elements.stage.style.width = '0px'
      elements.stage.style.height = '0px'
      return
    }

    const bounds = getContentBounds(svg)
    intrinsicSvgWidth = parseSvgDimension(svg, 'width')
    intrinsicSvgHeight = parseSvgDimension(svg, 'height')
    contentOffsetX = Math.max(0, -bounds.left)
    contentOffsetY = Math.max(0, -bounds.top)
    state.stageSvgWidth = bounds.width
    state.stageSvgHeight = bounds.height
    svg.style.display = 'block'
    svg.style.transformOrigin = 'top left'
  }

  return {
    renderSvg(svgMarkup) {
      elements.stage.innerHTML = svgMarkup
      syncStageMetrics()
      applyZoom()
    },
    zoomIn() {
      state.stageZoom = clampZoom(state.stageZoom * ZOOM_STEP)
      applyZoom()
    },
    zoomOut() {
      state.stageZoom = clampZoom(state.stageZoom / ZOOM_STEP)
      applyZoom()
    },
    resetZoom() {
      state.stageZoom = 1
      applyZoom()
    },
    fitZoom() {
      const width = state.stageSvgWidth
      const height = state.stageSvgHeight
      if (width <= 0 || height <= 0) {
        return
      }

      const viewportWidth = Math.max(1, elements.stageViewport.clientWidth - 24)
      const viewportHeight = Math.max(1, elements.stageViewport.clientHeight - 24)
      state.stageZoom = clampZoom(Math.min(viewportWidth / width, viewportHeight / height))
      elements.stageViewport.scrollLeft = 0
      elements.stageViewport.scrollTop = 0
      applyZoom()
    },
    syncZoomLabel,
  }
}
