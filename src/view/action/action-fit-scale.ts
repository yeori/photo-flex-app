import { AbstractAction } from '.'
import { Unsubscriber } from '../../event'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam } from '../../types'
import { dom } from '../../util'
export class ActionFitCover extends AbstractAction {
  private _unsub: Unsubscriber | undefined
  constructor(_ctx: PhotoFlexContext, param: ActionParam) {
    super(_ctx, param)
  }
  protected createElement(): HTMLButtonElement {
    const btn = dom.createFromHtml<HTMLButtonElement>(
      `<button class="blue" data-photoflex-action aria-label="${this.label}"></button>`
    )
    btn.disabled = true
    return btn
  }
  run(): void {
    const { id } = this.param
    if (id === 'fit-contain') {
      this.context.op.fitByContain()
    } else if (id === 'fit-cover') {
      this.context.op.fitByCover()
    } else if (id === 'fit-real') {
      this.context.op.fitToRealSize()
    } else {
      throw new Error('check scaleMode: ' + id)
    }
  }
  dispose(): void {
    this._unsub?.()
  }
}
