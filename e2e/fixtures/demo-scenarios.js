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

export const demoScenarios = {
  'glyph-two-repeat': {
    shape: {
      kind: 'text-mask',
      text: '23',
      font: '700 420px Arial',
      size: {
        mode: 'fit-content',
        padding: 10,
      },
      shapeTextMode: 'whole-text',
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
