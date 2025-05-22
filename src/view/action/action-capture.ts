import { AbstractAction } from '.'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam } from '../../types'
import { dom } from '../../util'

/**
 * Action to capture the current viewport content and trigger download.
 */
export class CaptureAction extends AbstractAction {
  constructor(_ctx: PhotoFlexContext, param: ActionParam) {
    super(_ctx, param)
  }

  protected createElement<K extends HTMLButtonElement>(): K {
    const btn = dom.createFromHtml<K>(`
      <button class="blue" data-photoflex-action aria-label="Capture viewport image">
        <span class="material-symbols-outlined">capture</span>
      </button>
    `)
    btn.disabled = true
    this.context.subscribe('open', () => {
      btn.disabled = false
    })
    return btn
  }

  async run(): Promise<void> {
    try {
      this.context.op.sendCapture()
    } catch (error) {
      console.error('Error during capture:', error)
    }
  }
}
