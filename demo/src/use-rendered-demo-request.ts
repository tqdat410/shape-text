import { useEffect, useState } from 'react'

import { createCanvasTextMeasurer, layoutTextInShape, renderLayoutToSvg, type ShapeTextLayout } from 'shape-text'

import type { DemoRequest } from './demo-model'

const measurer = createCanvasTextMeasurer()

type RenderedDemoRequest = {
  layout: ShapeTextLayout | null
  svg: string
  error: string
}

function renderDemoRequest(request: DemoRequest): RenderedDemoRequest {
  try {
    const layout = layoutTextInShape({
      ...request.layout,
      measurer,
    })

    return {
      layout,
      svg: renderLayoutToSvg(layout, request.render),
      error: '',
    }
  } catch (error) {
    return {
      layout: null,
      svg: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function useRenderedDemoRequest(request: DemoRequest) {
  const [rendered, setRendered] = useState<RenderedDemoRequest>(() => renderDemoRequest(request))

  useEffect(() => {
    const nextRendered = renderDemoRequest(request)
    setRendered(current =>
      nextRendered.error.length === 0 || current.svg.length === 0
        ? nextRendered
        : { ...current, error: nextRendered.error },
    )
  }, [request])

  return rendered
}
