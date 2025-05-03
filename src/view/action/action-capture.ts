import { AbstractAction } from '.'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

/**
 * Action to capture the current viewport content and trigger download.
 */
export class CaptureAction extends AbstractAction {
  constructor(private readonly _ctx: PhotoFlexContext) {
    // Inject context
    super({ id: 'capture', label: 'Capture' })
  }

  protected createElement(): HTMLElement {
    const btn = dom.createFromHtml<HTMLButtonElement>(`
      <button class="blue" data-photoflex-action aria-label="Capture viewport image">
        <span class="material-symbols-outlined">capture</span>
      </button>
    `)
    btn.disabled = true
    this._ctx.subscribe('open', () => {
      btn.disabled = false
    })
    return btn
  }

  async run(): Promise<void> {
    try {
      this._ctx.op.sendCapture()
    } catch (error) {
      console.error('Error during capture:', error)
    }
  }
}
