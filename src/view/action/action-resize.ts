import { AbstractAction } from '.'
import { DimensionSelector } from '../../component/dimension-selector'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionResizeParam } from '../../types'
import { dom } from '../../util'
/**
 * show resize view
 */
export class ResizeAction extends AbstractAction {
  options: { width: number; height: number }[]
  useDefaultUI: boolean
  constructor(_ctx: PhotoFlexContext, param: ActionResizeParam) {
    super(_ctx, param)
    this.options = param.options!
    this.useDefaultUI = param.useDefaultUI !== false
  }
  protected createElement(): HTMLButtonElement {
    const btn = dom.createFromHtml<HTMLButtonElement>(
      `<button class="blue" data-photoflex-action aria-label="Resize viewport"></button>`
    )
    this.context.subscribe('open', () => {
      this.context.op.hideeModal()
    })
    return btn
  }

  run(): void {
    if (this.useDefaultUI) {
      this.context.op.showModal(
        new DimensionSelector(this.context, this.options)
      )
    } else {
      this.context.eventBus.emit('action', {
        target: 'resize',
        payload: { options: this.options }
      })
    }
  }
}
