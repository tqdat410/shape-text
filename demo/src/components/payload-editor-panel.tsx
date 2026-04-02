import { useEffect, useState } from 'react'

import type { DemoRequest } from '../demo-model'
import { parseDemoRequest, serializeDemoRequest } from '../demo-payload'

type PayloadEditorPanelProps = {
  request: DemoRequest
  onApply: (value: DemoRequest) => void
}

export function PayloadEditorPanel(props: PayloadEditorPanelProps) {
  const [draft, setDraft] = useState(() => serializeDemoRequest(props.request))
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isDirty) {
      setDraft(serializeDemoRequest(props.request))
    }
  }, [isDirty, props.request])

  function handleApply() {
    try {
      props.onApply(parseDemoRequest(draft, props.request))
      setError('')
      setIsDirty(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError))
    }
  }

  function handleReset() {
    setDraft(serializeDemoRequest(props.request))
    setError('')
    setIsDirty(false)
  }

  return (
    <details className="panel">
      <summary>Advanced payload editor</summary>

      <p className="panel-copy">Edit the raw `layoutTextInShape()` and `renderLayoutToSvg()` request only when you need full control.</p>

      <label className="field">
        <span>Payload JSON</span>
        <textarea
          aria-label="Payload JSON"
          className="payload-textarea"
          value={draft}
          onChange={event => {
            setDraft(event.target.value)
            setIsDirty(true)
          }}
        />
      </label>

      <div className="button-row">
        <button type="button" onClick={handleApply}>
          Apply JSON
        </button>
        <button type="button" onClick={handleReset}>
          Reset JSON
        </button>
      </div>

      {error.length > 0 ? (
        <p aria-live="polite" className="error-box" data-testid="payload-error">
          {error}
        </p>
      ) : null}
    </details>
  )
}
