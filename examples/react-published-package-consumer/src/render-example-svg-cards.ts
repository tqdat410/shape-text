import {
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
} from 'shape-text'

type ExampleCard = {
  title: string
  description: string
  svg: string
}

type ExampleCardOptions = {
  fillText: string
}

const measurer = createCanvasTextMeasurer()

function renderCardSvg(input: Parameters<typeof layoutTextInShape>[0]) {
  const layout = layoutTextInShape(input)

  return renderLayoutToSvg(layout, {
    background: '#f8fafc',
    shapeStyle: {
      // Replace the palette or omit `shapeStyle` if you only want raw text output.
      backgroundColor: '#dbeafe',
      borderColor: '#94a3b8',
      borderWidth: 2,
      shadow: {
        blur: 8,
        offsetY: 8,
      },
    },
  })
}

export function renderExampleSvgCards(options: ExampleCardOptions): ExampleCard[] {
  return [
    {
      title: 'Geometry shape',
      description: 'Polygon input rendered with the published npm package.',
      svg: renderCardSvg({
        text: 'Shape paragraph layout works directly inside explicit geometry too.',
        textStyle: {
          // Swap the font stack, size, weight, or color to match your own UI.
          family: 'Arial, sans-serif',
          size: 16,
          weight: 700,
          color: '#0f172a',
        },
        lineHeight: 22,
        shape: {
          // Replace `polygon` with `text-mask` if the shape should come from a glyph string.
          kind: 'polygon',
          points: [
            { x: 0, y: 10 },
            { x: 300, y: 0 },
            { x: 340, y: 160 },
            { x: 170, y: 260 },
            { x: 0, y: 160 },
          ],
        },
        measurer,
      }),
    },
    {
      title: 'Value-derived shape',
      description: 'Text-mask input with max fill enabled for decorative coverage.',
      svg: renderCardSvg({
        text: options.fillText,
        textStyle: {
          family: 'Arial, sans-serif',
          size: 10,
          weight: 700,
          color: '#0f172a',
        },
        lineHeight: 10,
        // Set `autoFill: false` to keep ordinary paragraph flow instead of repeat fill.
        autoFill: true,
        shape: {
          kind: 'text-mask',
          // Replace with any value-derived glyph string such as `SALE` or `08:45`.
          text: '23',
          font: '700 250px Arial',
          size: {
            // Use `fixed` plus `width` / `height` when you need strict raster bounds.
            mode: 'fit-content',
            padding: 8,
          },
        },
        measurer,
      }),
    },
  ]
}
