import { AbstractAction } from '.'
import { Unsubscriber } from '../../event'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class ActionFitCover extends AbstractAction {
  private readonly icons: Record<string, string> = {
    cover: 'fullscreen',
    contain: 'fit_screen',
    real: 'view_real_size',
  }
  private _unsub: Unsubscriber | undefined
  constructor(
    private readonly _ctx: PhotoFlexContext,
    private readonly scale: 'cover' | 'contain' | 'real'
  ) {
    super({
      id: `fit-${scale}`,
      label: scale.charAt(0).toUpperCase() + scale.substring(1),
    })
  }
  protected createElement(): HTMLElement {
    const btn =
      dom.createFromHtml<HTMLButtonElement>(`<button data-photoflex-action title="${
        this.label
      }">
      <span class="material-symbols-outlined">${this.icons[this.scale]}</span>
    </button>`)
    btn.disabled = true
    this._unsub = this._ctx.op.eventBus.subscribe('open', () => {
      btn.disabled = false
    })
    return btn
  }
  run(): void {
    if (this.scale === 'contain') {
      this._ctx.op.fitByContain()
    } else if (this.scale === 'cover') {
      this._ctx.op.fitByCover()
    } else if (this.scale === 'real') {
      this._ctx.op.fitToRealSize()
    } else {
      throw new Error('check scaleMode: ' + this.scale)
    }
  }
  dispose(): void {
    this._unsub?.()
  }
}
