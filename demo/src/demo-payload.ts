import type { DemoRequest } from './demo-model'

import { cloneDemoRequest } from './demo-model'
import { assertObject } from './demo-payload-primitives'
import { mergeDemoLayoutPayload } from './merge-demo-layout-payload'
import { mergeDemoRenderPayload } from './merge-demo-render-payload'

export function serializeDemoRequest(request: DemoRequest) {
  return JSON.stringify(request, null, 2)
}

export function parseDemoRequest(jsonText: string, fallback: DemoRequest): DemoRequest {
  const root = assertObject(JSON.parse(jsonText), 'payload')
  const layout = assertObject(root.layout, 'payload.layout')
  const render = assertObject(root.render, 'payload.render')
  const nextRequest = cloneDemoRequest(fallback)

  mergeDemoLayoutPayload(nextRequest, layout)
  mergeDemoRenderPayload(nextRequest, render)

  return nextRequest
}
