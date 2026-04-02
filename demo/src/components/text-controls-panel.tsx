import { fillTextPresets, type FillPresetId } from '../demo-presets'

type TextControlsPanelProps = {
  text: string
  fillPresetId: FillPresetId
  autoFill: boolean
  textSize: number
  lineHeight: number
  textWeight: string
  textItalic: boolean
  textColor: string
  onTextChange: (value: string) => void
  onFillPresetChange: (value: FillPresetId) => void
  onFillPresetReroll: () => void
  onAutoFillChange: (value: boolean) => void
  onTextSizeChange: (value: number) => void
  onLineHeightChange: (value: number) => void
  onTextWeightChange: (value: string) => void
  onTextItalicChange: (value: boolean) => void
  onTextColorChange: (value: string) => void
}

export function TextControlsPanel(props: TextControlsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Paragraph</h2>
        <p>Choose the paragraph, max-fill source text, and readable text styling.</p>
      </div>

      <label className="field">
        <span>Text</span>
        <textarea
          aria-label="Paragraph text"
          value={props.text}
          onChange={event => props.onTextChange(event.target.value)}
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>Fill preset</span>
          <div className="button-row">
            <select
              aria-label="Fill preset"
              value={props.fillPresetId}
              onChange={event => props.onFillPresetChange(event.target.value as FillPresetId)}
            >
              {fillTextPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={props.onFillPresetReroll}
              disabled={props.fillPresetId === 'custom'}
            >
              Reroll
            </button>
          </div>
        </label>

        <label className="field checkbox-field">
          <span>Auto fill</span>
          <input
            aria-label="Auto fill"
            type="checkbox"
            checked={props.autoFill}
            onChange={event => props.onAutoFillChange(event.target.checked)}
          />
        </label>

        <label className="field">
          <span>Weight</span>
          <select
            aria-label="Text weight"
            value={props.textWeight}
            onChange={event => props.onTextWeightChange(event.target.value)}
          >
            <option value="400">Regular</option>
            <option value="700">Bold</option>
          </select>
        </label>

        <label className="field checkbox-field">
          <span>Italic</span>
          <input
            aria-label="Italic"
            type="checkbox"
            checked={props.textItalic}
            onChange={event => props.onTextItalicChange(event.target.checked)}
          />
        </label>

        <label className="field">
          <span>Text color</span>
          <input
            aria-label="Text color"
            type="color"
            value={props.textColor}
            onChange={event => props.onTextColorChange(event.target.value)}
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Text size: {props.textSize}px</span>
          <input
            aria-label="Text size"
            type="range"
            min="14"
            max="34"
            step="1"
            value={props.textSize}
            onChange={event => props.onTextSizeChange(Number(event.target.value))}
          />
        </label>

        <label className="field">
          <span>Line height: {props.lineHeight}px</span>
          <input
            aria-label="Line height"
            type="range"
            min="18"
            max="40"
            step="1"
            value={props.lineHeight}
            onChange={event => props.onLineHeightChange(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  )
}
