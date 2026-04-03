import {
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
  type LayoutTextInShapeOptions,
  type TextMeasurer,
} from 'shape-text'

type CreateIctClockSvgOptions = {
  clockValue: string
  fillText: string
}

export function createIctClockLayoutOptions(
  options: CreateIctClockSvgOptions & {
    measurer: TextMeasurer
  },
): LayoutTextInShapeOptions {
  return {
    text: options.fillText,
    textStyle: {
      family: '"Ubuntu", sans-serif',
      size: 13,
      weight: 400,
      color: '#f1dfcf',
    },
    lineHeight: 13,
    autoFill: true,
    shape: {
      kind: 'text-mask',
      text: options.clockValue,
      font: '700 340px Ubuntu',
      size: {
        mode: 'fit-content',
        padding: 16,
      },
    },
    measurer: options.measurer,
  }
}

export function createIctClockSvg(
  options: CreateIctClockSvgOptions & {
    measurer?: TextMeasurer
  },
): string {
  const layout = layoutTextInShape(
    createIctClockLayoutOptions({
      ...options,
      measurer: options.measurer ?? createCanvasTextMeasurer(),
    }),
  )

  return renderLayoutToSvg(layout)
}
