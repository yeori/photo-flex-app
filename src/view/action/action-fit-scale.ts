import { AbstractAction } from '.'
import { Unsubscriber } from '../../event'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam } from '../../types'
import { dom } from '../../util'
export class ActionFitCover extends AbstractAction {
  private readonly icons: Record<string, string> = {
    cover: 'fullscreen',
    contain: 'fit_screen',
    real: 'view_real_size',
  }
  private _unsub: Unsubscriber | undefined
  constructor(
    _ctx: PhotoFlexContext,
    private readonly scale: 'cover' | 'contain' | 'real',
    param: ActionParam
  ) {
    super(param, _ctx)
  }
  protected createElement<K extends HTMLElement>(): K {
    const btn =
      dom.createFromHtml<HTMLButtonElement>(`<button class="blue" data-photoflex-action aria-label="${
        this.label
      }">
      <span class="material-symbols-outlined">${this.icons[this.scale]}</span>
    </button>`)
    btn.disabled = true
    return btn as unknown as K
  }
  run(): void {
    if (this.scale === 'contain') {
      this.context.op.fitByContain()
    } else if (this.scale === 'cover') {
      this.context.op.fitByCover()
    } else if (this.scale === 'real') {
      this.context.op.fitToRealSize()
    } else {
      throw new Error('check scaleMode: ' + this.scale)
    }
  }
  dispose(): void {
    this._unsub?.()
  }
}
