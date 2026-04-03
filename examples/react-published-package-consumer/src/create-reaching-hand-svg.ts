import {
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
  type LayoutTextInShapeOptions,
  type TextMeasurer,
} from 'shape-text'
import { createReachingHandShape } from './create-reaching-hand-shape'

type CreateReachingHandSvgOptions = {
  fillText: string
}

export function createReachingHandLayoutOptions(
  options: CreateReachingHandSvgOptions & {
    measurer: TextMeasurer
  },
): LayoutTextInShapeOptions {
  return {
    text: options.fillText,
    textStyle: {
      family: '"Ubuntu", sans-serif',
      size: 6,
      weight: 400,
      color: '#d8a07f',
    },
    lineHeight: 7,
    autoFill: true,
    shape: createReachingHandShape(),
    measurer: options.measurer,
  }
}

export function createReachingHandSvg(
  options: CreateReachingHandSvgOptions & {
    measurer?: TextMeasurer
  },
): string {
  const layout = layoutTextInShape(
    createReachingHandLayoutOptions({
      ...options,
      measurer: options.measurer ?? createCanvasTextMeasurer(),
    }),
  )

  return renderLayoutToSvg(layout)
}
